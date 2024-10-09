import RPi.GPIO as GPIO
import serial
import time

"""
transmitter.py코드를 참고하여 flask위에서 사물식별을 진행하고, 이때 사물이 식별되면 따로 브랜치 콜백에 들어가서 
분류기를 회전시키고 1초 동안 컨베이어벨트를 움직이는 작업은 진행하도록 함.
"""