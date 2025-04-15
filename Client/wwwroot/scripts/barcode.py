import RPi.GPIO as GPIO
import time
from time import sleep
import os

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
GPIO.setup(16, GPIO.OUT)
GPIO.output(16, GPIO.LOW)

class GTIN(object):

    def __init__(self, barcode=''):
        self.barcode = barcode

    def __checkDigit(self, digits):
            #total = sum(digits) + sum(map(lambda d: d*2, digits[-1::-2]))
            total = sum(digits) + sum([d*2 for d in digits[-1::-2]])
            return (10 - (total % 10)) % 10

    def validateCheckDigit(self, barcode=''):
        barcode = (barcode if barcode else self.barcode)
        if len(barcode) in (8,12,13,14) and barcode.isdigit():
            #digits = map(int, barcode)
            digits = [int(s) for s in barcode]
            checkDigit = self.__checkDigit( digits[0:-1] )
            return checkDigit == digits[-1]
        return False

    def addCheckDigit(self, barcode=''):
        barcode = (barcode if barcode else self.barcode)
        if len(barcode) == 13 and barcode.isdigit():
            #digits = map(int, barcode)
            digits = [int(s) for s in barcode]
            return true
        return false

barcodeDataOld = ""
barcodeDataId = 0

print("[Info] Iniciando leitor de código de barras...")
print("[Info] Aguardando leitura...")

try:
    while True:
        # Aguarda input do leitor de código de barras
        barcodeData = input().strip()
        
        if len(barcodeData) == 13:  # Verifica se é um código EAN13
            GPIO.output(16, GPIO.HIGH)
            time.sleep(0.75)
            GPIO.output(16, GPIO.LOW)
            time.sleep(1)
            
            if barcodeDataOld != '0':
                barcodeDataId += 1
                barcodeIsNew = GTIN(barcodeData)
                if barcodeIsNew:
                    print("[INFO] Código lido: {} ID: {}".format(barcodeData, barcodeDataId))
                    arquivo = open("/home/pi/Desktop/Arquivos/Barcode/{}_{}.txt".format(barcodeDataId, barcodeData), "a")
                    arquivo.write("")
                    arquivo.close()

except KeyboardInterrupt:
    print("[INFO] Programa finalizado pelo usuário...")
    GPIO.cleanup()