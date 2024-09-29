import RPi.GPIO as GPIO
import serial
import time

# 사용할 GPIO핀의 번호를 설정
apple_button_pin = 14 # Apple
lemon_button_pin = 15 # Lemon
orange_button_pin = 18 # Orange

# 시리얼 통신 설정
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
ser.flush()

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM) #핀모드 설정(GPIO.BCM/GPIO.BOARD)

# 버튼 핀의 입력설정, PULL DOWN 설정(입출력 초기화하는 코드인듯)
GPIO.setup(apple_button_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(lemon_button_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(orange_button_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)


while 1:
    if GPIO.input(apple_button_pin) == GPIO.HIGH:
        print("Apple!!")
        ser.write(b"A\n")
        time.sleep(0.1)
    elif GPIO.input(lemon_button_pin) == GPIO.HIGH:
        print("Lemon!!")
        ser.write(b"L\n")
        time.sleep(0.1)
    elif GPIO.input(orange_button_pin) == GPIO.HIGH:
        print("Orange!!")
        ser.write(b"O\n")
        time.sleep(0.1)