import RPi.GPIO as GPIO
import time
import state
class LED:
    def __init__(self):
        self.pin: int = 18
        self.timesPerSecond: int = 2 #2 Times Per Second
        self.duration: int = 5 #5 Seconds

    def turnOn(self):
        state.led_active = True
        return
    
    def flash(self, seconds):
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(self.pin,GPIO.OUT)

        GPIO.output(18,GPIO.HIGH)
        time.sleep(seconds)
        GPIO.output(18,GPIO.LOW)
        time.sleep(seconds)

    def flashing(self, times) -> None:
        second: int = 1
        sleepTime = second/times
        timeSleepPerFlash = sleepTime/times

        self.breakTimePerFlash: float = second - sleepTime
        print(f"LED flashing {times} times.")
        for time in range(times):
            self.flash(timeSleepPerFlash)
    
    def flashingWithTimePerSecondAndDuration(self, timesPerSecond=2, duration=5):
        startTime: float = time.time()
        while time.time() - startTime < duration + 1:
            self.flashing(times=timesPerSecond)
            time.sleep(self.breakTimePerFlash)
        print(f"Stop after {duration} seconds.")
            
    def modifyFlashingFunction(self, newTimesPerSecond=None, newDuration=None):
        if newTimesPerSecond is not None:
            self.timesPerSecond = newTimesPerSecond
        if newDuration is not None:
            self.duration = newDuration
        return True if newTimesPerSecond is not None or newDuration is not None else False
        
    def startLEDFlashingFunction(self):
        while state.led_active:
            if state.motion_detected:
                self.flashingWithTimePerSecondAndDuration(
                    self.timesPerSecond,
                    self.duration
                )

if __name__ == "__main__":
    led = LED()
    led.flashingWithTimePerSecondAndDuration(timesPerSecond=3, duration=5)    




