from cameraService import camera
import os, datetime, time
from stream import output  # use the shared global output
import state

class Camera:
    def __init__(self):
        self.filePath = os.environ.get("CAPTURE_DIR", "/home/pi/IntruderDetector/capture")
        os.makedirs(self.filePath, exist_ok=True)
        self.camera = camera
        self.output = output
    
    def turnOn(self):
        state.camera_active = True
        return

    #Capture Video Function With Specific Time
    def CaptureVideo(self, seconds):
        try:
            self.camera.start_preview()
            self.camera.start_recording(f"{self.filePath}/NewAlertVideo.h264")
            self.camera.wait_recording(seconds)
            # self.camera.split_recording(self.output)
            self.camera.stop_recording()
            self.camera.stop_preview()
            
        except Exception as ex:
            print(f"Recording Error: {ex}")

    def GetCurrentTime(self):
        currentDatetime = datetime.datetime.now().strftime("%d-%m-%Y_%H:%M:%S")
        return currentDatetime

    def ConvertH264ToMP4(self):
        time.sleep(1)  # Give time for file to finalize
        h264_file = f"{self.filePath}/NewAlertVideo.h264"
        if os.path.exists(h264_file) and os.path.getsize(h264_file) > 0:
            fileName = f"MotionAlert_{self.GetCurrentTime()}.mp4"
            os.system(f"MP4Box -add {h264_file} {self.filePath}/{fileName}")
            print(f"Saved: {fileName}")
        else:
            print("Error: H264 file is empty or missing.")

    def startRecordingIfMotionDetected(self):
        while state.camera_active:
            if state.motion_detected:
                print("[Camera] Motion detected, starting capture")
                self.CaptureVideo(8)
                time.sleep(1)
                self.ConvertH264ToMP4()

if __name__ == "__main__":
    camera = Camera()
    camera.CaptureVideo(10)
    camera.ConvertH264ToMP4()
