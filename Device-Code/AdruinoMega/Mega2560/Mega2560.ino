#include <DHT.h>          
 
#define DHTPIN 7
#define DHTTYPE DHT11 //Khai báo loại cảm biến, có 2 loại là DHT11 và DHT22

//Chu kỳ thời gian gửi
unsigned long previousMillis = 0;
long Sensor_Freq = 10000;
 
DHT dht(DHTPIN, DHTTYPE);

#include <ArduinoJson.h>

//Thư viện giao tiếp thay thế SoftwareSerial Adruino <-->ESP8266 
#include <AltSoftSerial.h>
#include <SoftwareSerial.h>
#include <SerialCommand.h>  // Thêm vào sketch thư viện Serial Command
const byte RX = 48;          // Chân 3 được dùng làm chân RX
const byte TX = 46;          // Chân 2 được dùng làm chân TX
String data="";

//Thông số nhiệt độ
float Sensor_t=30;

//thông số độ ẩm
float Sensor_h=70;


AltSoftSerial AltSerial=AltSoftSerial(RX, TX); 
SoftwareSerial mySerial = SoftwareSerial(RX, TX); 
 
#define led1 8  // Arduino LED on board

SerialCommand sCmd(mySerial); // Khai báo biến sử dụng thư viện Serial Command
 
 
void setup() {
  pinMode(led1,OUTPUT);
  digitalWrite(led1, LOW);
  //Khởi tạo Serial ở baudrate 57600 để debug ở serial monitor
  Serial.begin(57600);
 
  //Khởi tạo Serial ở baudrate 57600 cho cổng Serial thứ hai, dùng cho việc kết nối với ESP8266
  mySerial.begin(57600);
  AltSerial.begin(57600);  

  // Một số hàm trong thư viện Serial Command
  sCmd.addDefaultHandler(defaultCommand);
  Serial.println("Da san sang nhan lenh");
  digitalWrite(led1, HIGH);
  delay(1000);
  digitalWrite(led1, LOW);  
}
 
void loop() {
  //Sau 1 khoảng thời gian xác định -->Gửi Dữ liệu lên Server
  if (millis() - previousMillis > Sensor_Freq) {
     previousMillis = millis();
     Serial.println("Send Request");
     sendDHT11info();
  }
  
  while(AltSerial.available()){
   data+= (char)AltSerial.read();  //gets one byte from serial buffer
   }
   
  if(data!=""){
    Serial.println("Recv data:");
    Serial.println(data);
    
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(data);
    
    //Lấy key name json
    JsonObject::iterator it=root.begin();
    String key=(String)it->key;
    
     if (key.equals("Sensor_Freq")) {
      Sensor_Freq=     atoi(root["Sensor_Freq"])*60000;
      Serial.println("Sensor_Freq");
      Serial.println(Sensor_Freq); 
      
      //Hồi đáp lại Server
      commitData("RES","Sensor_Freq");    
      }
      
      else if(key.equals("Sensor_t")) {
        Sensor_t=        atoi(root["Sensor_t"]);
        Sensor_h=        atoi(root["Sensor_h"]);    
        Serial.println("Sensor_t");
        Serial.println(Sensor_t);
        Serial.println("Sensor_h");
        Serial.println(Sensor_h);
        
        //Hồi đáp lại Server
        commitData("RES","Sensor_th"); 
      }
      //Kiểm Tra Relay
      else if(key.equals("testRelay")) {
        Serial.println("Test Relay");
        String stt=        root["testRelay"];
        Serial.println("Stt:"+stt);
        testRelay(stt);
    }
  }
    data="";
    
  //Kích hoạt Relay
  ActiveRelay();
  delay(1000);
}


//Kích hoạt Relay khi kiểm tra giá trị nhiệt độ, độ ẩm vượt ngưỡng
void ActiveRelay(){
  float h = dht.readHumidity();    //Đọc độ ẩm
  float t = dht.readTemperature(); //Đọc nhiệt độ
  if (isnan(h) || isnan(t)) {
     Serial.println("Failed to read from DHT sensor!");
     return;
  }
  else{
    if(t>=Sensor_t && h>=Sensor_h){
      Serial.println("---------Relay Active");
      Serial.println("Temp:"+String(t)+"|Humini:"+String(h));
      digitalWrite(led1, HIGH);
      //Hồi đáp lại Server
      commitData("RES","RelayActive"); 
    }
    else{
      digitalWrite(led1, LOW);
    }
    delay(1000);
  }
}

//Kích hoạt Relay khi kiểm tra giá trị nhiệt độ, độ ẩm vượt ngưỡng
void testRelay(String data){
  //Serial.println("Relay Active: "+data);     
      if(data=="ON"){
        digitalWrite(led1, HIGH);
        delay(1000);
        }
       else if(data=="OFF"){
        digitalWrite(led1, LOW); 
        }
      String sttRelay="OFF";
      if(digitalRead(led1)) sttRelay="ON";
      Serial.println("Relay stt:"+sttRelay);
      
      // Tạo chuỗi Json để gửi lên Server
      StaticJsonBuffer<200> jsonBuffer2;
      JsonObject& root2 = jsonBuffer2.createObject();
      root2["Data"] = "testRelay";
      root2["Status"] = data;

      //Hồi đáp lại Server
      //in ra cổng software serial để ESP8266 nhận
      Serial.println("Send data to ESP8266");
      mySerial.print("RES");   //gửi tên lệnh
      mySerial.print('\r');           // gửi \r
      
      root2.printTo(mySerial); //gửi chuỗi JSON
      mySerial.print('\r');           // gửi \r
     
      //in ra Serial để debug
      root2.printTo(Serial); //Xuống dòng  
    delay(1000);
  }

 
void defaultCommand(String command) {
  char *json = sCmd.next();
  Serial.println("Unpack JSon");
  Serial.println(command);
  Serial.println(json);
  }

//Gửi Dữ liệu đến ESP8266
void commitData(String Content,String Data){
  // Tạo chuỗi Json để gửi lên Server
  StaticJsonBuffer<200> jsonBuffer2;
  JsonObject& root2 = jsonBuffer2.createObject();
  root2["Data"] = Data;
  
  //in ra cổng software serial để ESP8266 nhận
  Serial.println("Send data to ESP8266");
  mySerial.print(Content);   //gửi tên lệnh
  mySerial.print('\r');           // gửi \r
  
  root2.printTo(mySerial); //gửi chuỗi JSON
  mySerial.print('\r');           // gửi \r
 
  //in ra Serial để debug
  root2.printTo(Serial); //Xuống dòng  
  }

  
//Gửi giá trị nhiệt độ, độ ẩm đến ESP8266
void sendDHT11info() {
  float h = dht.readHumidity();    //Đọc độ ẩm
  float t = dht.readTemperature(); //Đọc nhiệt độ
  if (isnan(h) || isnan(t)) {
     Serial.println("Failed to read from DHT sensor!");
     return;
  }
  // Tạo chuỗi Json để gửi lên Server
  StaticJsonBuffer<200> jsonBuffer2;
  JsonObject& root2 = jsonBuffer2.createObject();
  root2["Temperature"] = t;
  root2["Humidity"] = h;
  
  //in ra cổng software serial để ESP8266 nhận
  Serial.println("Send data to ESP8266");
  mySerial.print("TMP");   //gửi tên lệnh
  mySerial.print('\r');           // gửi \r
  root2.printTo(mySerial); //gửi chuỗi JSON
  mySerial.print('\r');           // gửi \r
 
  //in ra Serial để debug
  root2.printTo(Serial); //Xuống dòng

  //Serial.print("Nhiet do: "); Serial.println(t);
  //Serial.print("Do am: ");    Serial.println(h);
  
  delay(1000);
}

