#include <SoftwareSerial.h>
#include <AltSoftSerial.h>
#include <SerialCommand.h>

const byte RX = 48;          // Chân 3 được dùng làm chân RX
const byte TX = 46;          // Chân 2 được dùng làm chân TX

 String data;
SoftwareSerial mySerial = SoftwareSerial(RX, TX);
AltSoftSerial AltSerial=AltSoftSerial(RX, TX);;

//Khai báo biến sử dụng thư viện Serial Command
SerialCommand sCmd(mySerial);

void setup() {
  //Serial Begin at 9600 Baud 
  Serial.begin(57600);
  mySerial.begin(57600);
  AltSerial.begin(57600);
  
//  sCmd.addCommand("LED",   led);
  sCmd.addDefaultHandler(defaultCommand);
}

void loop() {
            Serial.println("Send Request");
            mySerial.print("ADRUINO");
            mySerial.print('\r');
            delay(500);
            
            while (AltSerial.available())
            {
            //delay(50);
            char c = AltSerial.read();  //gets one byte from serial buffer
            Serial.print(c);
            }
            
            sCmd.readSerial();
            delay(1000);
}

void led() {
  Serial.println("LED");
  char *json = sCmd.next(); //Chỉ cần một dòng này để đọc tham số nhận đươc
  Serial.println(json);
}

void defaultCommand(String command) {
  char *json = sCmd.next();
  Serial.println("Recv data");
  Serial.println(command);
  Serial.println(json);
}
