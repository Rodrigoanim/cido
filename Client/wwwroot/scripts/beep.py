import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
BUZZER = 23
GPIO.setup(BUZZER, GPIO.OUT)
GPIO.output(BUZZER, True)
time.sleep(0.35)
GPIO.output(BUZZER, False)