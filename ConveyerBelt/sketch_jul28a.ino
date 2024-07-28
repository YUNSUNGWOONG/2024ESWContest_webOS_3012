#include <AccelStepper.h>

#define enablePin 8
#define dirxPin 2 //5
#define stepxPin 5 //2
#define motorInterfaceType 1
#define cmdxPin 13
#define sensorx 9

AccelStepper stepperx = AccelStepper(motorInterfaceType, stepxPin, dirxPin);
int statex;


void setup() {
  
  pinMode(enablePin, OUTPUT);
  pinMode(sensorx, INPUT);
  pinMode(cmdxPin, OUTPUT);
  digitalWrite(enablePin, LOW);
  digitalWrite(cmdxPin, HIGH);
  stepperx.setMaxSpeed(1000);
  stepperx.setSpeed(-900);
}

void loop() {
  statex = digitalRead(sensorx);
  if(statex == HIGH)
  {
    digitalWrite(cmdxPin, LOW);
    stepperx.stop();
  }
  else
  {
    digitalWrite(cmdxPin, HIGH);
    stepperx.setSpeed(-900);
    stepperx.runSpeed();
  }

}
