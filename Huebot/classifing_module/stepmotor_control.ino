#include <Servo.h>

/* 
휴봇 스텝모터 각도제어
*/ 

Servo myservo;  // create servo object to control a servo

void setup() {
  Serial.begin(9600);  // start serial communication at 9600 bps
  myservo.attach(9);   // attaches the servo on pin 9 to the servo object
  Serial.println("Enter 1 for 0 degrees, 2 for 90 degrees, 3 for 180 degrees:");
}

void loop() {
  if (Serial.available() > 0) {
    int input = Serial.parseInt();  // read the input
    switch (input) {
      case 1:
        myservo.write(0);  // move servo to 0 degrees
        Serial.println("Servo moved to 0 degrees");
        break;
      case 2:
        myservo.write(90);  // move servo to 90 degrees
        Serial.println("Servo moved to 90 degrees");
        break;
      case 3:
        myservo.write(180);  // move servo to 180 degrees
        Serial.println("Servo moved to 180 degrees");
        break;
      default:
        Serial.println("Invalid input, please enter 1, 2, or 3.");
        break;
    }
    delay(500);  // wait for half a second before the next read
  }
}
