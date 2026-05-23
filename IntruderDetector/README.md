# 🛡️ Intruder Detector: Smart IoT Security System

An integrated, real-time security system that detects motion using Raspberry Pi, alerts users instantly, and streams live camera footage, all remotely accessible via a SwiftUI iOS app. The backend is powered by and Flask, while user authentication and real-time status updates are managed using Supabase.

---

## 🚀 Project Overview

The **Intruder Detector** is a smart home/office security solution built with:

- 📱 **SwiftUI** for the mobile interface
- 🐍 **Flask** for backend services
- 🧠 **Raspberry Pi** for sensor control and local processing
- 🔐 **Supabase** for secure authentication and real-time communication

It’s designed to **detect intrusions**, **warn intruders**, and **alert homeowners**, all while offering an intuitive UI for live video monitoring.

---

## 🎯 Features

| Feature               | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| 🕵️ Motion Detection   | PIR sensor detects movement and triggers alerts                    |
| 🔴 LED Warning System | LED flashes to warn intruders when motion is detected              |
| 📹 Live Streaming     | MJPEG camera stream from Raspberry Pi available through mobile app |
| 📱 SwiftUI iOS App    | User-friendly mobile interface for login, monitoring, and alerts   |
| 🔒 Supabase Auth      | Secure login/logout functionality for authorized access only       |
| 🌐 Flask Server       | Serves the frontend and manages API endpoints for motion data      |
| 📁 Local Recording    | All detected activity is recorded locally for future review        |

---

## 🧰 Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Frontend  | SwiftUI (iOS)                           |
| Backend   | Flask                                   |
| Database  | Supabase (PostgreSQL)                   |
| Hardware  | Raspberry Pi, PIR Sensor, LED, PiCamera |
| Protocols | HTTP, MJPEG                             |

---

## 🔒 Security

JWT-based secure login via Supabase.
Local-only API server by default.
Minimal attack surface: only essential endpoints exposed.
Camera streams and recordings are stored locally, not in the cloud.

---

## 🧩 System Architecture

![System Architecture](system_architecture.png)

## ✨ Future Enhancements

AI Integration: Face recognition or intruder classification via AI
Real-time: Push notifications and SMS, siren alerts
Cloud: Cloud video backup and storage.

---

## 📸 Mobile App Screens

| 🔍 Main Dashboard                 | 📹 Camera View                       | ⚙️ Detector View                            |
| --------------------------------- | ------------------------------------ | ------------------------------------------- |
| ![Main](Design/App/Dashboard.png) | ![Camera](Design/App/CameraView.png) | ![Detector](Design/App/DetectorView.png) () |

---

## 🛠️ Getting Started

### 🔧 Prerequisites

- Raspberry Pi with Python ≥ 3.8 installed
- PIR motion sensor, red LED, PiCamera module
- Xcode for iOS development
- Supabase account (for auth & real-time DB)
- Flask installed on Raspberry Pi

### 🖥️ Backend Setup

```bash
# Clone 2 branches: server, gui

# Setup Server
git clone -b server https://github.com/EoCiMrEo/IntruderDetector
cd BackendServer

# Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Update SUPABASE_URL and SUPABASE_API_KEY in .env

# Run Server
python main.py

```

### 📱 iOS App Setup

# Setup GUI

1. git clone -b gui https://github.com/EoCiMrEo/IntruderDetector
2. cd IntruderDetector(GUI)
3. Open IntruderDetector.xcodeproj
4. Set BACKEND_HOST for the app (for example in your Run scheme environment variables)
5. Build and run the app on your iOS device

---
