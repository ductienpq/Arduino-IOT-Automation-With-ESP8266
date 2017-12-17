#include <SoftwareSerial.h>
//#include <SerialCommand.h>

const byte RX = D1;
const byte TX = D2;
String data;

//include thư viện để kiểm tra free RAM trên con esp8266
extern "C" {
  #include "user_interface.h"
}

SoftwareSerial mySerial(RX, TX, false, 256);
//SoftwareSerial mySerial = SoftwareSerial(RX, TX);

// Khai báo biến sử dụng thư viện Serial Command
//SerialCommand sCmd(mySerial);

void setup() {
  //Serial Begin at 9600 Baud 
  Serial.begin(57600);
  mySerial.begin(57600);
  //sCmd.addDefaultHandler(defaultCommand);
}

void loop() {
   Serial.println("Send Request");
   mySerial.print("ESP");
   mySerial.print('\r');
   mySerial.print("DATA");
   mySerial.print('\r');   
   delay(500);
   
   while (mySerial.available()){
     char c = mySerial.read();  //gets one byte from serial buffer
     //Serial.println("Data");
     Serial.println(c);
  }   
   //sCmd.readSerial();
   delay(1000);
}

/*
void defaultCommand(String command){
  char *json = sCmd.next();
  Serial.println("Recv data");
  Serial.println(command);
  Serial.println(json);
}
*/
