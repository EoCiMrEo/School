from flask import Flask, jsonify, request
from led import LED
from pir import PIR
from camera import Camera
from threading import Thread
import state
import requests
import os
from supabase import create_client
from dotenv import load_dotenv
from stream import start_streaming

app = Flask(__name__)

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_API_KEY")
BACKEND_PORT = int(os.environ.get("BACKEND_PORT", "5000"))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_API_KEY must be set in the environment.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

streamThread = Thread(target=start_streaming, daemon=True)
streamThread.start()

pir = PIR()
pir.turnOn()
pirThread = Thread(target=pir.startDetecting, daemon=True)
led = LED()
led.turnOn()
ledThread = Thread(target=led.startLEDFlashingFunction, daemon=True)
camera = Camera()
camera.turnOn()
cameraThread = Thread(target=camera.startRecordingIfMotionDetected, daemon=True)
pirThread.start()
ledThread.start()
cameraThread.start()

@app.route("/modifyFlashingFunction", methods=['POST'])
def modifyFlashingFunction():
    data = request.get_json()
    newTimesPerSecond = data.get("newTimesPerSecond")
    newDuration = data.get("newDuration")
    
    success = led.modifyFlashingFunction(newTimesPerSecond, newDuration)
    if success:
        response = supabase.table("LED").update({"flashTimesPerSecond": int(newTimesPerSecond)}).eq("id",2).execute()
        if response:
            return jsonify({"message": "LED flashing configuration updated successfully!"}), 200
    else:
        return jsonify({"message": "No valid configuration values provided."}), 400

@app.route("/modifySensitivity", methods=['POST'])
def modifySensitivity():
    try:
        data = request.get_json()
        newSensitivity = data.get("newSensitivityLevel")
        allowed_levels = [1, 2, 3, 4]
        
        if newSensitivity is None:
            return jsonify({"error": "Missing sensitivityLevel"}), 400

        if not isinstance(newSensitivity, int) or newSensitivity <= 0:
            return jsonify({"error": "sensitivityLevel must be a positive integer"}), 400
        
        if newSensitivity not in allowed_levels:
            return jsonify({
                "error": f"sensitivityLevel must be one of {allowed_levels}"
            }), 400
        
        responseFromFunction = pir.sensitivityModifier(newSensitivity)
        if responseFromFunction:
            response = supabase.table("PIR").update({'sensitivityLevel': int(newSensitivity)}).eq('id',1).execute()
            if response:
                return jsonify({"message": "Successfully updated PIR sensitivity level!"}), 200
    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500
    
@app.route("/status", methods=['GET'])
def getStatus():
    return jsonify({"motion_detected": state.motion_detected})

@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    response = requests.post(f"{SUPABASE_URL}/auth/v1/signup",
        headers={
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": email,
            "password": password
        }
    )
    if response.status_code == 200 or response.status_code == 201:
        return jsonify({"message": "User registered successfully"})
    else:
        return jsonify({"error": response.json()}), response.status_code

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": email,
            "password": password
        }
    )

    if response.status_code == 200:
        return jsonify(response.json())  # contains access_token, etc.
    else:
        return jsonify({"error": response.json()}), response.status_code

@app.route('/getSensitivityLevel', methods=['GET'])
def getSensitivityLevel():
    try:
        response = supabase.table("PIR").select("sensitivityLevel").execute()
        if response.data is None:
            return jsonify({"error": "No data found"}), 404

        level = response.data
        return jsonify(level)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/getFlashingTimes', methods=['GET'])
def getFlashingTimes():
    try:
        response = supabase.table("LED").select("flashTimesPerSecond").execute()
        if response.data is None:
            return jsonify({"error": "No data found"}), 404

        level = response.data
        return jsonify(level)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=BACKEND_PORT)
