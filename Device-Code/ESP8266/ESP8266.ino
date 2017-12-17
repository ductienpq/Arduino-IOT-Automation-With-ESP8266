#include <SoftwareSerial.h>
#include <SerialCommand.h>

#include <SocketIOClient.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>

//include thư viện để kiểm tra free RAM trên con esp8266
extern "C" {
  #include "user_interface.h"
}
#define led1 D0  // Arduino LED on board

const byte RX = D1;
const byte TX = D2;
 
//SoftwareSerial mySerial = SoftwareSerial(RX, TX); 
SoftwareSerial mySerial = SoftwareSerial(RX, TX, false, 256);
// Khai báo biến sử dụng thư viện Serial Command
SerialCommand sCmd(mySerial);

SocketIOClient client;
const char* ssid = "Xom Tro";          //Tên mạng Wifi mà Socket server của bạn đang kết nối
const char* password = "sqtt2016";

const char* host = "192.168.1.250";  //Địa chỉ IP dịch vụ, hãy thay đổi nó theo địa chỉ IP Socket server của bạn.
int port = 8000;                  //Cổng dịch vụ socket server do chúng ta tạo!

//Một số biến dùng cho việc tạo một task
unsigned long previousMillis = 0;
long interval = 5000;

//String Auth ="{\"Name\":\"ESP\",\"Pass\":\"qwerty@123\"}";
//String Auth ="{Name:ESP,Pass:qwerty@123}";

String json;
bool flag_Connect=false;
bool flag_Reconnect = false;
unsigned int count=0; 
String cmd;

//từ khóa extern: dùng để #include các biến toàn cục ở một số thư viện khác. Trong thư viện SocketIOClient có hai biến toàn cục
// mà chúng ta cần quan tâm đó là
// RID: Tên hàm (tên sự kiện
// Rfull: Danh sách biến (được đóng gói lại là chuối JSON)
extern String RID;
extern String Rfull;

//StaticJsonBuffer<200> jsonBuffer2;
//StaticJsonBuffer<200> jsonBuffer;
//include thư viện để kiểm tra free RAM trên con esp8266
extern "C" {
  #include "user_interface.h"
}

void setup()
{
  pinMode(led1, OUTPUT);
    //Bật baudrate ở mức 9600 để giao tiếp với máy tính qua Serial
    Serial.begin(57600);
   //Bật software serial để giao tiếp với Arduino, nhớ để baudrate trùng với software serial trên mạch arduino
    mySerial.begin(57600);
    delay(10);


 
    //Việc đầu tiên cần làm là kết nối vào mạng Wifi
    Serial.print("Ket noi vao mang ");
    Serial.println(ssid);
 
    //Kết nối vào mạng Wifi
    WiFi.begin(ssid, password);
 
    //Chờ đến khi đã được kết nối
    while (WiFi.status() != WL_CONNECTED) { //Thoát ra khỏi vòng lặp
        delay(500);
        Serial.print('.');
    }
 
    Serial.println();
    Serial.println(F("Da ket noi WiFi"));
    Serial.println(F("Di chi IP cua ESP8266: "));
    Serial.println(WiFi.localIP());
 
    if (!client.connect((char *)host, port)) {
        Serial.println(F("Ket noi den socket server that bai!"));
        return;
    }
    //Khi đã kết nối thành công
    //Gui thong tin ESP de xac thuc
    connect2Host();
    digitalWrite(led1, HIGH);
    delay(1000);
    digitalWrite(led1, LOW);

    sCmd.addDefaultHandler(defaultCommand); //Lệnh nào đi qua nó cũng bắt hết, rồi chuyển xuống hàm defaultCommand!
    Serial.println("Da san sang nhan lenh...");
}

void loop()
{
  while(flag_Connect){
       sCmd.readSerial();
      //tạo một task cứ sau "interval" giây thì chạy lệnh:
        
        if (millis() - previousMillis > interval) {
            previousMillis = millis();
            
            Serial.println("Send Request");
        }
        delay(500);
        //Nhận Lệnh Từ Server
        Serial.println("Wait command...");  

        if(client.monitor()){
          Serial.println("Recv Data from Server");
          Serial.print(RID);
          Serial.print(' ');
          Serial.println(Rfull);

          
          //in ra serial cho Arduino

          //Lưu Cấu hình Network
          if(RID=="Server-Send-ESP-SynNetworkConfig"){
             StaticJsonBuffer<200> jsonBuffer;
             JsonObject& root = jsonBuffer.parseObject(Rfull);

             
             ssid=        root["SSID"];
             password=    root["SSID_Password"];
             host=        root["Server_IP"];
             port=        atoi(root["Server_Port"]);
             
             Serial.println("Update SSID: ");
             Serial.println(ssid);
             Serial.println("Update SSID_Password: ");
             Serial.println(password); 
             Serial.println("Update Server: ");
             Serial.println(host);
             Serial.println("Update Port: ");
             Serial.println(port);

             //Hồi đáp lại Server
             commitData();  
             Serial.println("try to reset Connect...");
             resetConnect();          
                          
            }

          //Lưu Cấu hình thời gian cập nhật: Sensor_Freq
          if(RID=="Server-Send-ESP-SynSensor_FreqConfig"){
             StaticJsonBuffer<200> jsonBuffer;
             JsonObject& root = jsonBuffer.parseObject(Rfull);
              mySerial.print(Rfull);
            }
            
           //Lưu Cấu hình nhiệt độ, độ ẩm -->Relay
          if(RID=="Server-Send-ESP-SynRelayActive"){
             StaticJsonBuffer<200> jsonBuffer;
             JsonObject& root = jsonBuffer.parseObject(Rfull);
              mySerial.print(Rfull);
            }   
                    
           //Kiểm tra Relay
          if(RID=="Server-Send-ESP-testRelay"){
             StaticJsonBuffer<200> jsonBuffer;
             JsonObject& root = jsonBuffer.parseObject(Rfull);
              mySerial.print(Rfull);
            }  
                     
          //Kiểm tra xem còn dư bao nhiêu RAM, để debug
          uint32_t free = system_get_free_heap_size();
          Serial.println("Ram Free: "+free);
        }
        delay(1000);
  
    if (!client.connected()) {
       Serial.println("try to Reconnect...");
       checkConnect();
    }
    
    delay(1000);
  }
    connect2Host();
}


void defaultCommand(String command) {
  char *json = sCmd.next();
  
  //Hồi đáp lại Server  
  if(command=="TMP"){
  cmd="Adruino-Send-Server-Sensor-Status";
  client.send(cmd, (String) json);//gửi dữ liệu về cho Socket Server    
    }
    

  else if(command=="RES"){
  cmd="DeviceRespond";
  client.send(cmd, (String) json);//gửi dữ liệu về cho Socket Server    
  }

  //In ra serial monitor để debug
  Serial.print(cmd);
  Serial.print(' ');
  Serial.println(json);
  Serial.println("Tot lam, da gui du lieu roi, xem trong console cua Socket server di");
  cmd="";
}

  
void checkConnect(){
  if (!client.connected()) {
    client.reconnect((char *)host, port);
    delay(1000);
   connect2Host();
  }
}

void resetConnect(){
    client.reconnect((char *)host, port);
    delay(1000);
    connect2Host();
}

//Hồi đáp Lại Server
void commitData(){
  // Tạo chuỗi Json để gửi lên Server
  StaticJsonBuffer<200> jsonBuffer2;
  JsonObject& root2 = jsonBuffer2.createObject();
  root2["Data"] = "Esp8266";
  String json;
  root2.printTo(json);
  
  Serial.println("Esp8266 Respond to Server");

  cmd="DeviceRespond";
  client.send(cmd, json);//gửi dữ liệu về cho Socket Server 

  }



//============================================ AUTHENCATION ============================
//Make Json data
String makeAuthJson(){
   String data;
   StaticJsonBuffer<200> jsonBuffer2;
   JsonObject& root = jsonBuffer2.createObject();
   root["Name"] = "ESP";
   root["Pass"] = "qwerty@123";
   root.prettyPrintTo(data);
   //In ra man hinh
   //root.prettyPrintTo(Serial);
   return data;
}
//Try to Send Authencation & Respond from Server
void connect2Host(){
  flag_Connect=false;
  String Auth=makeAuthJson();
  while(!flag_Connect){
    Serial.println("Send Request to Server...");
    client.sendJSON("Client-Send-Get-DeviceName",Auth);
    delay(500);
    
    if(client.monitor()){
       Serial.println("Recv Data from Server");
       Serial.println(RID);
       Serial.println(Rfull);

       if(RID=="Server-Send-ESP-Connected-Status" && Rfull=="\"ON\""){
        flag_Connect=true;
        }
        
     if(flag_Connect){
        Serial.println("---------------------------------------");
        Serial.println(" Success: Get Authencation from Server ");
        Serial.println("---------------------------------------");   
      }      
       delay(1000);
    }     
 }
}
//============================================ AUTHENCATION ============================

