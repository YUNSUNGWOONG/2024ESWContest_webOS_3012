#include <stdio.h>



// 스텝모터 두개 다른 속도 컨베이어벨트 스타트로 운전, 스탑으로 정지 

// 모터 1 핀 설정
const int stepPin1 = 3;
const int dirPin1 = 4;

// 모터 2 핀 설정
const int stepPin2 = 5;
const int dirPin2 = 6;

// 모터 속도 (딜레이 시간, 마이크로초)
int speed1 = 500; // 모터 1의 속도
int speed2 = 1000; // 모터 2의 속도

bool isRunning = false; // 모터 상태

void setup() {
  // 모터 핀을 출력으로 설정
  pinMode(stepPin1, OUTPUT);
  pinMode(dirPin1, OUTPUT);
  pinMode(stepPin2, OUTPUT);
  pinMode(dirPin2, OUTPUT);

  // 모터 방향 설정
  digitalWrite(dirPin1, HIGH); // 모터 1의 방향 설정
  digitalWrite(dirPin2, HIGH); // 모터 2의 방향 설정

  // 시리얼 통신 시작
  Serial.begin(9600);
  Serial.println("Enter 'start' to run motors and 'stop' to stop motors.");
}

void loop() {
  // 시리얼 입력 처리
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // 명령어 앞뒤 공백 제거

    if (command == "start") {
      isRunning = true;
      Serial.println("Motors started.");
    } else if (command == "stop") {
      isRunning = false;
      Serial.println("Motors stopped.");
    } else {
      Serial.println("Invalid command. Enter 'start' or 'stop'.");
    }
  }

  // 모터 제어
  if (isRunning) 
  {
    // 모터 1 동작
    digitalWrite(stepPin1, HIGH);
    delayMicroseconds(speed1);
    digitalWrite(stepPin1, LOW);
    delayMicroseconds(speed1);

    // 모터 2 동작
    digitalWrite(stepPin2, HIGH);
    delayMicroseconds(speed2);
    digitalWrite(stepPin2, LOW);
    delayMicroseconds(speed2);
  }
}
