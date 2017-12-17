#define gas_pin A0
  
void setup()
{
    Serial.begin(9600);     // giao tiếp Serial với baudrate 9600
}
 
void loop()
{
cambienkhigas();
delay(500);
}

void cambienkhigas(){
  Serial.println("GAS: ");
  Serial.println(analogRead(gas_pin));
  if(analogRead(gas_pin)>=350)
  {
      Serial.println("PHAT HIEN KHI GAS: ");
      Serial.print(analogRead(gas_pin)); 
      delay(1000);
   }
  delay(500); 
}


