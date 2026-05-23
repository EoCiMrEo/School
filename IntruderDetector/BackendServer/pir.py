import RPi.GPIO
import time
import state
class PIR:
    def __init__(self):
        self.pin: int = 17
        self.isRunning: bool = False
        self.sensitivityLevel: int = 1
        self.waitTime: int = self.getWaitTimeBySensitivity(self.sensitivityLevel)

    def checkMotion(self):
        RPi.GPIO.setwarnings(False)
        RPi.GPIO.setmode(RPi.GPIO.BCM)
        RPi.GPIO.setup(self.pin, RPi.GPIO.IN)
        pirData = RPi.GPIO.input(self.pin)
        if pirData == 1:
            return True
        else:
            return False
        
    def turnOn(self):
        state.pir_active = True
        return
    
    def startDetecting(self):
        detectedTimes = 0
        detectedTime = None
        while state.pir_active:
            pirData = self.checkMotion()
            if pirData:
                print("Motion Detected !")
                if detectedTime == None:
                    detectedTime = time.time()
                detectedTimes += 1
                if detectedTimes > self.getMaxDetectedTimesBySensitivity(self.sensitivityLevel):
                    print("Confirm Detected Motion !")
                    state.motion_detected = True
                    detectedTimes = 0
                    detectedTime = None
                time.sleep(self.waitTime)
            else:
                if detectedTime == None:
                    continue
                else:
                    if time.time() - (detectedTime+(self.waitTime*detectedTimes)) > 10:
                        print("No Motion Detected !")
                        state.motion_detected = False
                        detectedTime = None
                        detectedTimes = 0

    def sensitivityModifier(self, newSensityvityLevel):
        if newSensityvityLevel is not None:
            self.sensitivityLevel = newSensityvityLevel
            self.waitTime = self.getWaitTimeBySensitivity(newSensityvityLevel)
            return newSensityvityLevel
        return
    
    def getWaitTimeBySensitivity(self, sensitivityLevel):
        waitTime = sensitivityLevel * 1
        return waitTime
    
    def getMaxDetectedTimesBySensitivity(self, sensitivityLevel):
        maxDetectedTimes = sensitivityLevel * 2
        return maxDetectedTimes

    
if __name__ == "__main__":
    pir = PIR()
    pir.startDetecting()