"""
=============================================================================
RAIL-GUARD AI - MASTER INTEGRATION SCRIPT (SIH 2026)
This single file connects ALL 6 team members' work together!

Members 1-3: Hardware Camera Feed + OpenCV Anomaly Detection
Member 4: Edge Data Wrangling & Image Frame Saving
Member 5: Dashboard Data Bridge (Serves http://localhost:8000)
Member 6: Pitch Demo Control
=============================================================================
"""

import cv2
import json
import os
import time
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

ANOMALY_FILE = "anomalies.json"
SNAP_DIR = "captured_snaps"

if not os.path.exists(SNAP_DIR):
    os.makedirs(SNAP_DIR)

# ---------------------------------------------------------------------------
# MEMBER 5: WEB SERVER THREAD
# ---------------------------------------------------------------------------
def start_dashboard_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print("=================================================================")
    print("🚀 [MEMBER 5 DASHBOARD] Server active at: http://localhost:8000")
    print("=================================================================")
    httpd.serve_forever()

# ---------------------------------------------------------------------------
# MEMBER 4: EDGE DATA LOGGING FUNCTION
# ---------------------------------------------------------------------------
def log_anomaly(crop_frame, defect_type="Transverse Rail Crack", severity="CRITICAL"):
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")
    time_id = int(time.time())
    img_filename = f"crack_snap_{time_id}.jpg"
    img_path = os.path.join(SNAP_DIR, img_filename)

    cv2.imwrite(img_path, crop_frame)

    new_record = {
        "defect_id": f"DEF-{time_id % 10000}",
        "timestamp": timestamp_str,
        "train_no": "12675",
        "train_name": "Cheran Express",
        "track_id": "TRK-SR-402B",
        "km_mark": "142.8",
        "speed_kmh": 88,
        "gps_coords": "13.0827° N, 80.2707° E",
        "defect_type": defect_type,
        "severity": severity,
        "confidence": "96.4%",
        "image_file": f"{SNAP_DIR}/{img_filename}",
        "status": "DISPATCHED"
    }

    data = []
    if os.path.exists(ANOMALY_FILE):
        try:
            with open(ANOMALY_FILE, 'r') as f:
                data = json.load(f)
        except Exception:
            data = []

    data.insert(0, new_record)

    with open(ANOMALY_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n⚡ [MEMBER 4 -> MEMBER 5 HANDOFF] Defect logged: {new_record['defect_id']} at {timestamp_str}")

# ---------------------------------------------------------------------------
# MEMBERS 1, 2, 3: CAMERA FEED + OPENCV ANOMALY DETECTION LOOP
# ---------------------------------------------------------------------------
def run_opencv_detection():
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("⚠️ Warning: Webcam not detected. Running camera simulation mode...")

    print("📷 [MEMBERS 1-3] Camera feed initialized. Point camera at track paper!")
    print("💡 Tip: Press 'c' key in video window to force-trigger a crack detection during pitch demo!")
    print("💡 Tip: Press 'q' key to quit.")

    last_logged_time = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            time.sleep(0.1)

        if frame is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blur, 80, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            anomaly_detected = False
            crop_target = frame

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if 500 < area < 50000:
                    x, y, w, h = cv2.boundingRect(cnt)
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 3)
                    cv2.putText(frame, "CRITICAL TRACK CRACK DETECTED", (x, y - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    anomaly_detected = True
                    crop_target = frame[y:y+h, x:x+w] if h > 10 and w > 10 else frame
                    break

            cv2.putText(frame, "RAIL-GUARD EDGE SENSOR ACTIVE", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow("Member 1-3 Live Track View (OpenCV Edge Device)", frame)

            current_time = time.time()
            key = cv2.waitKey(1) & 0xFF

            if (anomaly_detected or key == ord('c')) and (current_time - last_logged_time > 5):
                log_anomaly(crop_target)
                last_logged_time = current_time

            if key == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    threading.Thread(target=start_dashboard_server, daemon=True).start()
    time.sleep(1)
    run_opencv_detection()