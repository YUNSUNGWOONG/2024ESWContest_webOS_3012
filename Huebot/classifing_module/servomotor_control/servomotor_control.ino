#include <Servo.h>

Servo myservo;

//구역별 회전에 필요한 시간(1433ms는 360도 회전)
const int timeToReach120Degrees = 477 - 60; //120도 구역에 도달한 시간에서 15도에 해당하는 시간을 뺌
const int timeToReach240Degrees = 955 - 60; //240도 구역에 도달한 시간에서 15도에 해당하는 시간을 뺌
const int timeToReach360Degrees = 1433 - 60; //360도 회전에 해당하는 시간에서 15도에 해당하는 시간을 뺌

int currentTime = 0; //현재 위치를 기준으로 걸린 시간을 저장(0부터 시작)

// 목표위치에 도달하기 위한 시간 계산 함수
int getRotationTime(int targetTime){
  int rotationTime = targetTime - currentTime;
  if (rotationTime < 0){
    rotationTime += timeToReach360Degrees; //시계방향으로만 이동하도록 360도 더함
  }
  return rotationTime;
}

void setup(){
  Serial.begin(9600);
  myservo.attach(9); //서보모터 핀에 연결
  myservo.write(90);  // 중립 위치로 설정 (정지 상태)
  Serial.println("Enter 'L' for the center of the 1st zone, 'O' for the center of the 2nd zone, 'A' for the center of the 3rd zone.");
}

void loop(){
  if(Serial.available() > 0){
    char input = Serial.read(); //문자 입력 받기
    int targetTime = 0;         //목표 시간(구역별 회전시간)

    //입력에 따라 목표 시간 설정
    switch(input){
      case 'L':
      case 'l': //Lemon구역 (120도)
        targetTime = timeToReach120Degrees;
        Serial.println("Moving to the 1st zone (120 degrees)");
        break;

      case 'O':
      case 'o': //Orange구역 (240도)
        targetTime = timeToReach240Degrees;
        Serial.println("Moving to the 1st zone (240 degrees)");
        break;

      case 'A':
      case 'a': //Apple구역 (360도)
        targetTime = timeToReach360Degrees;
        Serial.println("Moving to the 1st zone (360 degrees)");
        break;

      default:
        Serial.println("Invalid input. Please enter 'L', 'O', or 'A'.");
        return;
    }
    // 목표시간까지의 회전 시간 계산
    int rotationTime = getRotationTime(targetTime);

    // 모터를 시계방향으로 회전 (회전시간에 비례하여 대기 시간 설정)
    myservo.write(0); // 시계방향 회전 시작
    delay(rotationTime); //목표 시간만큼 회전

    // 모터 장치
    myservo.write(90); //중립위치로 설정하여 모터 정지

    // 현재 시간 업데이트 (다음 회전시 기준이 됨)
    currentTime = targetTime;

    delay(500); //다음 입력을 기다리기 전에 약간의 지연




  }
}



