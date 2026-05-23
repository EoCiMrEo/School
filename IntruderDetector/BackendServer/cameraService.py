from picamera import PiCamera

# Singleton camera instance
camera = PiCamera(resolution='640x480', framerate=24)
