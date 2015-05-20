#include <SoftwareSerial.h>
#include "DHT.h"

const int pin_tx =  7; //62-->A8 // 50; // 7  
const int pin_rx =  8; //63--> A9; // 51; // 8
int onModulePin= 9; // sim900 power on/off module

SoftwareSerial gprsSerial(pin_tx,pin_rx);//TX,RX

int8_t answer;
char response[100];
char pin[16];
char temp[100];
int count=0;
char date[15], time[5],lon[7],lat[7],time1[5];
//String response;


// Sensor definations Warning: Do NOT use pins: 62, 63, 50, 51, 52, 4, 10, 11, 12, 13
#define DHTPIN1 5     // what pin temperature sensor is connected to
#define DHTPIN2 6     // what pin temperature sensor is connected to
#define DHTTYPE DHT22   // DHT 22  (Type of sensor used)
DHT dht1(DHTPIN1, DHTTYPE); // initiate connection to the temperature sensor
DHT dht2(DHTPIN2, DHTTYPE); // initiate connection to the temperature sensor

float t1=0;
float h1=0; 
float t2=0;
float h2=0;

unsigned long polling_time = 900000; // 900000 millisecond = 15 minutes: number of miliseconds to remain idle

char aux_str[80];
char http_cmd[]="PUT /api/postdata?id=1&t1=*****&h1=*****&t2=*****&h2=*****&long=******&lati=******&dt=**************** \r\n"; // 28th character is the first'*' in the string..  // has file name and id.. not add time and sensors values";
void setup(){
  dht1.begin(); // start the temperature sensor
  dht2.begin();
  
  int attempt = 0; // Variable to keep attempt made so far
  int GprsAttemt = 20; // Try to start the GPRS module for 20 attempts
  
  pinMode(onModulePin, OUTPUT);

  Serial.begin(19200);    
  Serial.println("Starting...");
  gprsSerial.begin(19200); // the baud rate used by GSM/GPRS shield
  
  while (GprsAttemt < attempt){
    if(power_on() == 0){
      Serial.println("Failed GSM Module to Start");
      break; // GPRS module is on, now Break this while loop!!
    }
    else{
      attempt = attempt + 1;
    }
  }
    
  Serial.println("clearing GPRS serial");
  
  // clear GPRS  
  while(gprsSerial.available()){Serial.println(gprsSerial.read());}
  
  // sets the PIN code
  sendATcommand2("AT+CPIN=0000", "OK", "ERROR", 2000);
    
  Serial.println("Connecting to the network...");
   attempt = 0; // Initialize attempt made so far to zero
   while( sendATcommand2("AT+CREG?", "+CREG: 0,1", "+CREG: 0,5", 1000) == 0  & attempt <= GprsAttemt) { // allow 50 attempts to connect 
        attempt= attempt + 1;    
   }
   
   if (attempt == GprsAttemt){
     Serial.println("could not connect to GPRS");
   }
   else{
     Serial.println("connection successful to GPRS");
   }
delay(3000);
}



void loop(){
  
  
  // TODO if sim900 is sleep, try to wake it up!!
  
  char input_char;
  unsigned long current_millis;
  Serial.println(http_cmd);
  
  update_sensor_reading(); // get current reading from sensor

    //location 
  getLocation();
  //time from gprs
  
   getDT();

  http_command();
  connect_nw(); // send update to server 
  delay(1000);




  // instead of sleeping, go on polling for if you receive any sms 
//  current_millis = millis();
//  Serial.println("Polling time Start");
//  Serial.print(current_millis);
//  
//  while(millis() < current_millis + polling_time){
//              delay(100); // slot of 0.10 seconds
//              Serial.println("in polling mode");
//              if (gprsSerial.available()>0){
//              input_char = gprsSerial.read();
//              Serial.println("GPRS available Read char:..."); 
//              Serial.println(input_char); 
//                        if (input_char == '@'){ // @b will send the response
//                          input_char = gprsSerial.read();
//                                      switch (input_char){
//                                        case 't':
//                                          Serial.println("Sending SMS FROM loop..."); 
//                                          SendSMS("Hello, test sms from sensor");
//                                          Serial.println("SMS Sent from loop");
//                                          break;
//                                      
//                                        case 'b':
//                                             // TODO Send balance 
//                                          break;
//                                          
//                                        case 'd':
//                                           GPRSData("0"); // disable GPRS data
//                                           break;
//                                        
//                                        case 'e':
//                                          GPRSData("1"); // enable GPRS data
//                                          break;
//                                        
//                                        case 'r':
//                                          gprsSerial.readBytes(pin, 15);
//                                          delay(10);
//                                          RechargeCredit(String(pin)); // top up using the scratch card received from the base station 
//                                          break;
//                                        case 's':
//                                          SendSensorReading(); // measure local temperature and send it to the base station 
//                                          break;
//                                    }
//                       }  
//              }
// }
//         
// Serial.println("Polling time END");
// Serial.print(current_millis);
Serial.print("have to wait!!!!!!!!!!!!!!!!!!!!!!!!!!");
delay(900000);
}

// TODO(DONE)
// Make the 'http_cmd' string pass as a parameter to this function !!
void connect_nw(){
    // Selects Single-connection mode
    if (sendATcommand2("AT+CIPMUX=0", "OK", "ERROR", 1000) == 1)
    {
        // Waits for status IP INITIAL
        while(sendATcommand2("AT+CIPSTATUS", "INITIAL", "", 500)  == 0 );
        delay(5000);
        
        // Sets the APN, user name and password
        if (sendATcommand2("AT+CSTT=\"du\",\"\",\"\"", "OK",  "ERROR", 30000) == 1)
        {            
            // Waits for status IP START
            while(sendATcommand2("AT+CIPSTATUS", "START", "", 500)  == 0 );
            delay(5000);
            
            // Brings Up Wireless Connection
            if (sendATcommand2("AT+CIICR", "OK", "ERROR", 30000) == 1)
            {
                // Waits for status IP GPRSACT
                while(sendATcommand2("AT+CIPSTATUS", "GPRSACT", "", 500)  == 0 );
                delay(5000);
                
                // Gets Local IP Address
                if (sendATcommand2("AT+CIFSR", ".", "ERROR", 10000) == 1)
                {
                    // Waits for status IP STATUS
                    while(sendATcommand2("AT+CIPSTATUS", "IP STATUS", "", 500)  == 0 );
                    delay(5000);
            //        Serial.println("Openning TCP");
                    
                    // Opens a TCP socket
                    //if (sendATcommand2("AT+CIPSTART=\"TCP\",\"systemdev.org\",\"80\"", //ServerName: systemdev.org  
                      if (sendATcommand2("AT+CIPSTART=\"TCP\",\"ec2-54-148-238-83.us-west-2.compute.amazonaws.com\",\"80\"", //ServerName: ec2-54-163-65-101.compute-1.amazonaws.com/php/
                            "CONNECT OK", "CONNECT FAIL", 30000) == 1)
                    {
                        Serial.println("Connected");
                        
                        // Sends some data to the TCP socket
                        sprintf(aux_str,"AT+CIPSEND=%d", strlen(http_cmd));
                        
                        if (sendATcommand2(aux_str, ">", "ERROR", 10000) == 1)    /////////////////////////////////////////////////can't send the data because it gives the 0 for response/////////////////////////////////////////////////////
                        {
                            sendATcommand2(http_cmd, "SEND OK", "ERROR", 10000);
                            Serial.println("sent data to server");
                        }
                        
                        // Closes the socket
                        sendATcommand2("AT+CIPCLOSE", "CLOSE OK", "ERROR", 10000);
                    }
                    else
                    {
                         Serial.println("Error openning the connection");
                    }  
                }
                else
                {
                      Serial.println("Error getting the IP address");
                }  
            }
            else
            {
                  Serial.println("Error bring up wireless connection");
            }
        }
        else
        {
           Serial.println("Error setting the APN");
        } 
    }
    else
    {
         Serial.println("Error setting the single connection");
    }   
    sendATcommand2("AT+CIPSHUT", "OK", "ERROR", 10000);
    delay(10000);
}

int8_t power_on(){
  int8_t attempt = 0;
  int8_t total_attempt = 25;  
  answer=0;
     // Serial.println("In power on"); 
    //  checks if the module is started
    answer = sendATcommand2("AT", "OK", "ERROR", 2000);
    if (answer == 0)
    {
        // power on pulse
        digitalWrite(onModulePin,HIGH);
        delay(3000);
        digitalWrite(onModulePin,LOW);
    
        // waits for an answer from the module
        while(answer == 0 && attempt < total_attempt){     // Send AT every two seconds and wait for the answer
            answer = sendATcommand2("AT", "OK", "ERROR", 2000); 
            attempt = attempt + 1;  
            Serial.print("Attempt:");
            Serial.print(attempt); 
        }
    }
return answer;
}

int8_t sendATcommand2(char* ATcommand, char* expected_answer1, char* expected_answer2, unsigned int timeout){
        Serial.println("in sendATcommand2");
        Serial.println(ATcommand);
    //  Serial.println(expected_answer1);
    //  Serial.println(expected_answer2);
    
    uint8_t x=0,  answer=0;
    
    unsigned long previous;

    memset(response, '\0', 100);    // Initialize the string

    delay(100);

    while( gprsSerial.available() > 0) gprsSerial.read();    // Clean the input buffer

    gprsSerial.println(ATcommand);    // Send the AT command 

    x = 0;
    previous = millis();

    // this loop waits for the answer
    do{
        // if there are data in the UART input buffer, reads it and checks for the asnwer
        if(gprsSerial.available() != 0){    
            response[x] = gprsSerial.read();
            x++;
            // check if the desired answer 1  is in the response of the module
            if (strstr(response, expected_answer1) != NULL) 
            {
                answer = 1;
                Serial.println("1234 PAPPU is PASS");
            }
            // check if the desired answer 2 is in the response of the module
            else if (strstr(response, expected_answer2) != NULL)    
            {
                answer = 2;
                Serial.println("1234 PAPPU is FAIL");
            }
        }
    }
    // Waits for the asnwer with time out
    while((answer == 0) && ((millis() - previous) < timeout));    
    // Serial.println(response);
    return answer;
}


void http_command(){

  update_sensor_reading();
  
  int http_idx = 26; // start adding char from 29th place in http_cmd "PUT /DataToFile.php?id=1&t1=<after this>"
  
  char charVal[5]; // xx.xx format 

  add_sensor_reading(http_idx, t1);
//  Serial.println(http_idx);
  http_idx = http_idx + 9;
//  Serial.println("stringVal: 1");Serial.println(http_cmd);
//  Serial.println(http_idx);
  add_sensor_reading(http_idx, h1);
  http_idx = http_idx + 9;
 // Serial.println(http_idx);
 // Serial.println("stringVal: 2");Serial.println(http_cmd);
  
  add_sensor_reading(http_idx, t2);
 //Serial.println(http_idx);
  http_idx = http_idx + 9; 
  
 // Serial.print("stringVal: 3");Serial.println(http_cmd);
 // Serial.println(http_idx);
  add_sensor_reading(http_idx, h2);
  http_idx = http_idx + 11;
//  http_cmd[http_idx]='\0';

//DataToFile.php?id=2&t1=*****&h1=*****&t2=*****&h2=*****&long=******&lat=******&dt=*********** \r\n";


  add_location(http_idx);
  http_idx = http_idx + 22;
  
  add_date(http_idx);
 // http_idx = http_idx + 11;
  
 
 
  Serial.print("stringVal: ");Serial.println(http_cmd); //display string
}

void add_sensor_reading(int pos, float val){
  char charVal[6];

  if(val == 0){
    for(int i=0;i<5;i++)
    {
     //Serial.print(charVal[i]);
     http_cmd[pos+i] =  '0';
    }
  }
  else{
    dtostrf(val, 4, 2, charVal);  
    for(int i=0;i<5;i++)
    {
     //Serial.print(charVal[i]);
     http_cmd[pos+i] =  charVal[i];
    }
  }
}

void update_sensor_reading(){  
  // first read is to flush the earlier value from buffer
  t1 = dht1.readTemperature();
  h1 = dht1.readHumidity();
  //t2 = dht2.readTemperature();
  //h2 = dht2.readHumidity();
  
  // this reading from sensor will actually represent the data taken at current time
  t1 = dht1.readTemperature();
  h1 = dht1.readHumidity();
  //t2 = dht2.readTemperature();
  //h2 = dht2.readHumidity();
  
  ////Chang//////
  Serial.print("Got sensor data");

}

// Generic function called by other functions.
void SendSMS(String message)
{
  Serial.println("Sending SMS from SendSMS function");
  gprsSerial.print("AT+CMGF=1\r");  // set SMS mode to text
  delay(100);
  gprsSerial.print("AT+CNMI=2,2,0,0,0\r"); // send the contents of new SMS upon receipt to the GSM/GPRS shield's serial out
  delay(100);
  gprsSerial.print("AT+CMGF=1\r"); //Because we want to send the SMS in text mode
  delay(100);
  gprsSerial.println("AT + CMGS = \"00971557820293\"");//send SMS message, need to add a country code before the cellphone number

  delay(100);
  gprsSerial.print("==>");
  gprsSerial.println(message);
  delay(1000);
  gprsSerial.println((char)26);//the ASCII code of the ctrl+z is 26
  delay(1000);
  gprsSerial.println();
  gprsSerial.println("AT+CMGD=1,4"); // delete all SMS in memory otherwise memory will becmoe full and we will not be able to receive new SMS 
  delay(1000);
}

// Initiate GPRS connection to the Telecom operator and transmit data via GPRS connection.
void GPRSData(String status)
{
  uint8_t answer=0;

  String string = "AT+CGATT="+status;
  char command[30];
  string.toCharArray(command,30);

  answer = sendATcommand2("AT+CGATT=1", "OK","ERROR", 10000);
  if (answer == 1)
  {
    if (status == "1") 
      SendSMS("GPRS successfully activated.");
    else
      SendSMS("GPRS deactivated");
  } 
}

// this function samples temperature sensor and sends the reading to the base station
void SendSensorReading()
{
  float t = dht1.readTemperature();
  char buffer[15];
  String s1,s2;
  // check if returns are valid, if they are NaN (not a number) then something went wrong!
 // TODO: Add more sensor readings in SMS
  if (isnan(t)) {
    gprsSerial.println("Failed to read from temperature sensor");
  } 
  else {
    s1 = dtostrf(t, 8, 2, buffer);
    s2 = "Temperature = "+s1+" *C";
    SendSMS(s2);
  }
}


// Send the current credit balance status to the base station via SMS.
void SendRemainingBalanceStatus()
{  
  uint8_t answer=0;
  answer = sendATcommand2("ATD*135#", "\",","ERROR", 10000); // changed the command according the telecom operator
  String str = String(response);
  delay(1000);
  if (answer == 1)
  {
    SendSMS(str.substring(50));      
  }
}

// Top-up using the scratch card number received from the base station.
void RechargeCredit(String pin)
{
  Serial.println("In RechargeCredit : ");    
  answer=0; 
  String string = "ATD*135*"+pin+"#"; 

  char command[30];
  string.toCharArray(command,30); 
  
  answer = sendATcommand2(command, "\",", "ERROR", 10000);
  String str = String(response);
  if (answer == 1)
  {
    SendSMS(str.substring(44)); // only retain string characters between position 25 and 61
    // the rest is header information 
  Serial.println(str);    
  }
}


//data store in lon[] and lat[]

void getLocation()
 { 
   
   gprsSerial.println("AT+CSQ");
  delay(100);
 
  sendATgprs();// this code is to show the data from gprs shield, in order to easily see the process of how the gprs shield submit a http request, and the following is for this purpose too.
 
  gprsSerial.println("AT+CGATT?");
  delay(100);
 
  sendATgprs();
  
 // for accessing systemdev.org/sendTime
 
  gprsSerial.println("AT+SAPBR=2,1,\"CONTYPE\",\"GPRS\"");//setting the SAPBR, the connection type is using gprs
  delay(3000);
 
  sendATgprs();
 
  gprsSerial.println("AT+SAPBR=2,1,\"APN\",\"du\"");//setting the APN, the second need you fill in your local apn server
  delay(5000);
 
  sendATgprs();
 
  gprsSerial.println("AT+SAPBR=1,1");//setting the SAPBR, for detail you can refer to the AT command mamual
  delay(3000);
 
  sendATgprs();
  
  gprsSerial.println("AT+SAPBR=2,1");//setting the SAPBR, for detail you can refer to the AT command mamual
  delay(3000);
 
  sendATgprs();
   
   
   Serial.println("location");
   for(int i=0;i<5;i++){
   time1[i]=time[i];
   }
   delay(1000);
  gprsSerial.println("AT+CIPGSMLOC=1,1");//Get location, date and time
  delay(8000);
  sendATgprs();
  //Extract Longitude and latitude - only Decimal part(6 places)
  Serial.println("trying to get longtitude ");
  for(int j=37;j<=42;j++){
    lon[j-37]=temp[j]; 
    Serial.print(temp[j]);
  }
  
  Serial.print("trying to get latitude  ");
    for(int j=47;j<=52;j++){
     lat[j-47]=temp[j];
      Serial.print(temp[j]);
  }

  Serial.print("  ");
  
  }

 void getDT(){
   
  Serial.println("date and time");
  memset(temp, '\0', 100);  
  
   gprsSerial.println("AT+CSQ");
  delay(100);
 
  sendATgprs();// this code is to show the data from gprs shield, in order to easily see the process of how the gprs shield submit a http request, and the following is for this purpose too.
 
  gprsSerial.println("AT+CGATT?");
  delay(100);
 
  sendATgprs();
  
 // for accessing systemdev.org/sendTime
 
  gprsSerial.println("AT+SAPBR=2,1,\"CONTYPE\",\"GPRS\"");//setting the SAPBR, the connection type is using gprs
  delay(3000);
 
  sendATgprs();
 
  gprsSerial.println("AT+SAPBR=2,1,\"APN\",\"du\"");//setting the APN, the second need you fill in your local apn server
  delay(5000);
 
  sendATgprs();
 
  gprsSerial.println("AT+SAPBR=1,1");//setting the SAPBR, for detail you can refer to the AT command mamual
  delay(3000);
 
  sendATgprs();
  
  gprsSerial.println("AT+SAPBR=2,1");//setting the SAPBR, for detail you can refer to the AT command mamual
  delay(3000);
 
  sendATgprs();
  
  gprsSerial.println("AT+CIPGSMLOC=2,1");//Get date and time only
  Serial.println(response);
  delay(8000);
  sendATgprs();
  
  delay(5000);
  
  if((temp[32]=='0')&&(temp[33]==',')){   //can't pass the if statement, never get the data information
  //Extract date and time as required
  
  
  Serial.println("trying to get date and time");
  for(int j=34;j<=49;j++){
     date[j-34]=temp[j];
    // if(j==41)continue;
    //Serial.print(temp[j]);
   
  }
  
  
  count++;
  }
  else{
    count++;
    // Serial.println(count);
 }
 }
 
 //just to put return data in temp array
void sendATgprs(){
  int i=0;
  while(gprsSerial.available()!=0){
    if(i< 100){
      temp[i] = gprsSerial.read();
      Serial.write(temp[i]);
      //Serial.print(temp[i]);
      i = i + 1;
      
    }
    else
      Serial.write(gprsSerial.read());
    }
  }
 
 
 
void add_location(int pos){

//for location
    int lat_pos=pos+12;


    for(int i=0;i<6;i++)
    {
     //Serial.print(charVal[i]);
     http_cmd[pos+i] = lon[i];
     http_cmd[lat_pos+i] = lat[i];
    }
    
 }


void add_date(int pos)
{
        for(int i=0;i<16;i++)
        {
         //Serial.print(charVal[i]);
         http_cmd[pos+i] = date[i];
        }
}
        
    
    
    
  
