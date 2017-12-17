#include <DHT.h>          
 
#define DHTPIN 2
#define DHTTYPE DHT11 //Khai báo loại cảm biến, có 2 loại là DHT11 và DHT22
 
DHT dht(DHTPIN, DHTTYPE);
 
void setup() {
  Serial.begin(9600);
  dht.begin();         // Khởi động cảm biến
}
 
void loop() {
  float h = dht.readHumidity();    //Đọc độ ẩm
  float t = dht.readTemperature(); //Đọc nhiệt độ
  if (isnan(h) || isnan(t)) {
     Serial.println("Failed to read from DHT sensor!");
     return;
  }
  
  Serial.print("Nhiet do: "); Serial.println(t);
  Serial.print("Do am: ");    Serial.println(h);
  
  Serial.println();
  delay(1000);
}

