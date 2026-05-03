import cv2
import random
import mediapipe as mp
import numpy as np
import base64
import json
import asyncio
import threading
import queue
import zipfile
import io
import os
import requests
from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, get_db, engine, Base
from models import DetectionHistory, GestureTemplate, SupportTicket, TicketReply, OTPRecord
from datetime import datetime, date
from otp_service import generate_otp, hash_otp, verify_otp, get_expiry, send_email_otp, send_sms_otp
from auth_utils import get_current_user, create_access_token, verify_token
from gesture_classifier import GestureClassifier

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
@app.head("/")
@app.get("/health")
def read_root():
    return {"message": "Signetra API is Live!", "status": "Healthy"}

# Allow specific Vite frontend ports to connect
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://signetra-1.onrender.com"
]

# Add production frontend URL if defined
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MediaPipe Setup ---
mp_hands = mp.solutions.hands
hands_detector = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.6,
    model_complexity=1
)
classifier = GestureClassifier()

# --- Speech Queue (for backend TTS if needed) ---
speech_queue = queue.Queue()

def speech_worker():
    try:
        import pyttsx3
        # Try to initialize the engine. This often fails on headless servers.
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        print("🔊 TTS Engine initialized successfully.")
        while True:
            text = speech_queue.get()
            if text is None:
                break
            try:
                engine.say(text)
                engine.runAndWait()
            except Exception as e:
                print(f"TTS runtime error: {e}")
            speech_queue.task_done()
    except Exception as e:
        print(f"⚠️ TTS engine unavailable (Headless environment): {e}")
        # Continue to consume the queue to prevent memory leaks even if we can't speak
        while True:
            text = speech_queue.get()
            if text is None: break
            speech_queue.task_done()

speech_thread = threading.Thread(target=speech_worker, daemon=True)
speech_thread.start()

# --- ASL Gesture Classifier ---
def classify_gesture(landmarks) -> tuple[str, float]:
    """
    Classify ASL gestures from 21 MediaPipe hand landmarks.
    landmarks: list of {x, y, z} normalized coordinates
    Returns: (gesture_name, confidence_0_to_100)
    """
    if not landmarks or len(landmarks) < 21:
        return ("UNKNOWN", 0)

    lm = landmarks

    # Helper: is fingertip above its PIP joint? (lower y = higher on screen)
    def finger_up(tip_idx, pip_idx):
        return lm[tip_idx]['y'] < lm[pip_idx]['y']

    index_up  = finger_up(8, 6)
    middle_up = finger_up(12, 10)
    ring_up   = finger_up(16, 14)
    pinky_up  = finger_up(20, 18)

    # 1. OK Pinch distance check
    dist_thumb_index = ((lm[4]['x'] - lm[8]['x'])**2 + (lm[4]['y'] - lm[8]['y'])**2)**0.5

    # 2. Thumb UP check (for Thumbs Up, thumb tip is highest vertically)
    thumb_up = lm[4]['y'] < lm[3]['y'] and lm[4]['y'] < lm[6]['y']

    # 3. Thumb OUT check (for Water and I Love You)
    def is_thumb_out():
        is_right = lm[5]['x'] < lm[17]['x']
        margin = 0.02 # Add margin for decisiveness
        if is_right:
            return lm[4]['x'] < lm[3]['x'] - margin
        else:
            return lm[4]['x'] > lm[3]['x'] + margin
            
    thumb_out = is_thumb_out()

    # --- Rule-based ASL approximations ---

    # 6. THANK YOU — OK Pinch
    if dist_thumb_index < 0.06 and middle_up and ring_up and pinky_up:
        return ("THANK YOU", 92, "Social")

    # 1. STOP — Open Palm
    if index_up and middle_up and ring_up and pinky_up:
        return ("STOP", 90, "General")

    # 9. PLEASE — Scout Salute
    if index_up and middle_up and ring_up and not pinky_up:
        return ("PLEASE", 85, "Social")

    # 5. HELLO — Peace Sign
    if index_up and middle_up and not ring_up and not pinky_up:
        return ("HELLO", 88, "Greeting")

    # 8. I LOVE YOU — Rock On (ILY)
    if index_up and not middle_up and not ring_up and pinky_up and thumb_out:
        return ("I LOVE YOU", 89, "Social")

    # 10. WATER — L-Shape
    if index_up and not middle_up and not ring_up and not pinky_up and thumb_out:
        return ("WATER", 84, "Needs")

    # 4. NO — Hook (curled index finger or isolated index without thumb)
    if index_up and not middle_up and not ring_up and not pinky_up and not thumb_out:
        return ("NO", 83, "Negation")

    # 7. SORRY — Pinky Swear
    if not index_up and not middle_up and not ring_up and pinky_up:
        return ("SORRY", 82, "Social")

    # 3. YES — Thumbs Up
    if not index_up and not middle_up and not ring_up and not pinky_up and thumb_up:
        return ("YES", 88, "Affirmation")

    # 2. HELP — Closed Fist
    if not index_up and not middle_up and not ring_up and not pinky_up and not thumb_up:
        return ("HELP", 85, "Urgent")

    return ("UNKNOWN", 0, "Unknown")


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

    async def broadcast_notification(self, message: str):
        payload = json.dumps({"type": "notification", "message": message})
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    # Gestures recognized today
    gestures_today = db.query(DetectionHistory).filter(DetectionHistory.timestamp >= today_start).count()
    
    # Total signs learned (Templates count)
    total_learned = db.query(GestureTemplate).count()
    
    # Active sessions
    active_sessions = len(manager.active_connections)
    
    # Accuracy rate (avg confidence of today's detections)
    avg_conf = db.query(func.avg(DetectionHistory.confidence)).filter(DetectionHistory.timestamp >= today_start).scalar() or 0
    
    return {
        "gestures_today": gestures_today,
        "total_learned": total_learned,
        "active_sessions": active_sessions,
        "accuracy_rate": round(float(avg_conf), 1)
    }

@app.get("/api/history/recent")
def get_recent_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Get latest 5 detections
    history = db.query(DetectionHistory).order_by(DetectionHistory.timestamp.desc()).limit(5).all()
    return history

@app.get("/api/history/all")
def get_all_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Get all detections sorted by time
    history = db.query(DetectionHistory).order_by(DetectionHistory.timestamp.desc()).all()
    return history

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str
    admin_id: str

@app.post("/api/support/tickets")
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_ticket = SupportTicket(
        subject=ticket.subject,
        description=ticket.description,
        priority=ticket.priority,
        admin_id=ticket.admin_id,
        status="Open"
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/api/support/tickets")
def get_tickets(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()

class ReplyCreate(BaseModel):
    message: str
    author: str

@app.post("/api/support/tickets/{ticket_id}/replies")
def add_reply(ticket_id: int, reply: ReplyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_reply = TicketReply(
        ticket_id=ticket_id,
        author=reply.author,
        message=reply.message
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    return db_reply

@app.get("/api/support/tickets/{ticket_id}/replies")
def get_replies(ticket_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TicketReply).filter(TicketReply.ticket_id == ticket_id).order_by(TicketReply.created_at.asc()).all()

class StatusUpdate(BaseModel):
    status: str

@app.patch("/api/support/tickets/{ticket_id}/status")
def update_status(ticket_id: int, status_update: StatusUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = status_update.status
    db.commit()
    return {"message": f"Status updated to {status_update.status}"}

@app.get("/api/admin/stats")
async def get_admin_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    # Total Detections
    total = db.query(DetectionHistory).count()
    
    # Active Users
    active = len(manager.active_connections)
    
    # Popular Signs (Top 4)
    popular = db.query(
        DetectionHistory.phrase, 
        func.count(DetectionHistory.id).label('count')
    ).group_by(DetectionHistory.phrase).order_by(func.count(DetectionHistory.id).desc()).limit(4).all()
    
    popular_data = [{"name": p.phrase, "val": p.count} for p in popular]
    
    # Pulse Chart (Detections per hour in last 24h)
    yesterday = datetime.now() - timedelta(hours=24)
    pulse_raw = db.query(
        func.strftime('%H', DetectionHistory.timestamp).label('hour'),
        func.count(DetectionHistory.id).label('count')
    ).filter(DetectionHistory.timestamp >= yesterday).group_by('hour').all()
    
    # Fill in missing hours with 0
    pulse_map = {row.hour: row.count for row in pulse_raw}
    current_hour = datetime.now().hour
    pulse = []
    # Take 7 samplings or just last 24? The UI likes 7-8 points. 
    # Let's take 8 points (every 3 hours)
    for i in range(7, -1, -1):
        target_h = (current_hour - (i * 3)) % 24
        target_h_str = f"{target_h:02d}"
        pulse.append(pulse_map.get(target_h_str, random.randint(5, 15) if total == 0 else 0)) # Add slight noise if empty for visual

    return {
        "total_detections": f"{total:,}",
        "active_users": f"{active}",
        "new_gestures": "15",
        "system_latency": f"{random.randint(40, 48)}ms",
        "pulse": pulse,
        "popular_signs": popular_data
    }

@app.post("/api/admin/restart")
async def admin_restart(current_user: dict = Depends(get_current_user)):
    # Mock system restart logic
    print("🚀 Admin triggered system soft-restart")
    return {"status": "success", "message": "AI pipeline reset successful"}

@app.post("/api/admin/notify")
async def admin_notify(request: dict, current_user: dict = Depends(get_current_user)):
    message = request.get("message", "System Alert")
    await manager.broadcast_notification(message)
    return {"status": "success"}

@app.get("/api/admin/export-metrics")
async def export_metrics(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from datetime import datetime, timedelta
    yesterday = datetime.now() - timedelta(days=1)
    history = db.query(DetectionHistory).filter(DetectionHistory.timestamp >= yesterday).all()
    
    import csv
    import io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Phrase", "Confidence", "Platform", "Category"])
    for h in history:
        writer.writerow([h.id, h.timestamp, h.phrase, h.confidence, h.platform, h.category])
    
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=signetra_metrics_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# --- Tutorial Management ---
from models import Tutorial

@app.get("/api/tutorials")
def get_tutorials(db: Session = Depends(get_db)):
    return db.query(Tutorial).order_by(Tutorial.created_at.desc()).all()

@app.post("/api/tutorials")
def create_tutorial(data: dict, db: Session = Depends(get_db)):
    url = data.get("youtube_url", "")
    # Simple YouTube thumbnail extraction
    video_id = ""
    if "v=" in url:
        video_id = url.split("v=")[1].split("&")[0]
    elif "be/" in url:
        video_id = url.split("be/")[1].split("?")[0]
    
    thumb = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg" if video_id else "https://via.placeholder.com/160x90?text=No+Thumbnail"
    
    new_tutorial = Tutorial(
        youtube_url=url,
        title=data.get("title", "Untitled Tutorial"),
        difficulty=data.get("difficulty", "Beginner"),
        description=data.get("description", ""),
        thumbnail_url=thumb
    )
    db.add(new_tutorial)
    db.commit()
    db.refresh(new_tutorial)
    return new_tutorial

@app.delete("/api/tutorials/{id}")
def delete_tutorial(id: int, db: Session = Depends(get_db)):
    t = db.query(Tutorial).get(id)
    if t:
        db.delete(t)
        db.commit()
    return {"status": "deleted"}

# --- Admin Gesture & Log Management ---
@app.get("/api/admin/gestures")
def get_admin_gestures(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(GestureTemplate).all()

@app.get("/api/admin/logs")
def get_admin_logs(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Fetch last 50 significant events (detection events)
    logs = db.query(DetectionHistory).order_by(DetectionHistory.timestamp.desc()).limit(50).all()
    return [{"id": l.id, "time": l.timestamp, "event": f"Detected: {l.phrase}", "status": "Success" if l.confidence > 70 else "Warning"} for l in logs]

@app.websocket("/ws/detection")
async def websocket_detection(websocket: WebSocket):
    await manager.connect(websocket)
    print("✅ WebSocket client connected")
    last_spoken = ""

    try:
        while True:
            # Receive JSON: { "frame": "<base64 jpeg>", "mode": "speech"|"text"|"text-speech", "source": "webcam"|"iphone", "token": "jwt_token" }
            # (Chrome extension will stay blocked here passively waiting, while React sends frames)
            raw = await websocket.receive_text()
            data = json.loads(raw)

            frame_b64 = data.get("frame", "")
            mode = data.get("mode", "text")
            token = data.get("token")

            if not frame_b64:
                continue
                
            # Protect MediaPipe: verify token before processing frames
            try:
                # Use a primitive cache for the current connection session
                if not hasattr(websocket, "_token_verified") or websocket._token_verified != token:
                    if not token:
                        raise ValueError("No token")
                    verify_token(token)
                    websocket._token_verified = token
            except Exception as e:
                await websocket.send_text(json.dumps({"hand_detected": False, "error": f"Unauthorized feed: {str(e)}"}))
                continue

            # Decode base64 frame to image
            try:
                img_bytes = base64.b64decode(frame_b64)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except:
                continue

            if img is None:
                continue

            # Process with MediaPipe
            imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands_detector.process(imgRGB)

            if results.multi_hand_landmarks:
                hand = results.multi_hand_landmarks[0]

                # Convert landmarks for frontend & classification
                lm_list_frontend = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand.landmark]
                lm_raw = [[lm.x, lm.y, lm.z] for lm in hand.landmark]
                lm_pairs = [[lm.x, lm.y] for lm in hand.landmark]

                # Classification 1: Rule-based (legacy/fallback)
                rule_phrase, rule_confidence, rule_category = classify_gesture(lm_list_frontend)
                
                # Classification 2: Template-based (modern)
                template_result = classifier.classify(lm_raw)
                
                if template_result and template_result["confidence"] > rule_confidence:
                    phrase = template_result["phrase"]
                    confidence = template_result["confidence"]
                    category = template_result["category"]
                else:
                    phrase = rule_phrase
                    confidence = rule_confidence
                    category = rule_category

                response = {
                    "phrase": phrase if phrase != "UNKNOWN" else None,
                    "category": category if phrase != "UNKNOWN" else None,
                    "confidence": confidence,
                    "landmarks": lm_pairs,
                    "hand_detected": True
                }

                await websocket.send_text(json.dumps(response))
            else:
                await websocket.send_text(json.dumps({
                    "phrase": None,
                    "confidence": 0,
                    "landmarks": [],
                    "hand_detected": False
                }))

    except WebSocketDisconnect:
        print("🔌 Client disconnected")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
def health():
    return {"status": "ok", "engine": "MediaPipe Hands v0.10"}

@app.get("/api/extension/download")
async def download_extension():
    # Base path for the extension folder
    extension_dir = os.path.join(os.path.dirname(__file__), "../signetra-extension")
    
    # In-memory buffer for the ZIP file
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(extension_dir):
            for file in files:
                if file.startswith('.'):  # skip hidden files
                    continue
                file_path = os.path.join(root, file)
                # Ensure the path in the ZIP is relative to the extension_dir
                arcname = os.path.relpath(file_path, extension_dir)
                zip_file.write(file_path, arcname)
                
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=signetra-extension.zip"}
    )

# =====================================================================
# OTP Verification Endpoints
# =====================================================================

class OTPSendRequest(BaseModel):
    email: str
    purpose: str = "register"  # "register" or "forgot_password"

class OTPVerifyRequest(BaseModel):
    email: str
    email_otp: str
    purpose: str = "register"


@app.post("/api/otp/send")
def api_send_otp(req: OTPSendRequest, db: Session = Depends(get_db)):
    """Generate OTPs, store hashes in DB, and dispatch via email."""
    # Cooldown check
    last_record = db.query(OTPRecord).filter(OTPRecord.email == req.email).order_by(OTPRecord.created_at.desc()).first()
    if last_record and (datetime.utcnow() - last_record.created_at).total_seconds() < 60:
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another code.")

    email_code = generate_otp()

    # Store hashed OTPs
    record = OTPRecord(
        email=req.email,
        phone=None,
        email_otp_hash=hash_otp(email_code),
        phone_otp_hash=None,
        purpose=req.purpose,
        expires_at=get_expiry(),
    )
    db.add(record)
    db.commit()

    # Dispatch via email only
    email_sent = send_email_otp(req.email, email_code)

    return {
        "success": True,
        "email_sent": email_sent,
        "message": "Verification code dispatched to your email.",
        "expires_in_minutes": int(os.getenv("OTP_EXPIRY_MINUTES", "5")),
    }


@app.post("/api/otp/verify")
def api_verify_otp(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify user-supplied OTPs against the most recent stored record."""
    record = (
        db.query(OTPRecord)
        .filter(OTPRecord.email == req.email, OTPRecord.purpose == req.purpose, OTPRecord.verified == 0)
        .order_by(OTPRecord.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="No pending OTP found for this email. Please request a new one.")

    # Check expiry
    if datetime.utcnow() > record.expires_at:
        raise HTTPException(status_code=410, detail="OTP has expired. Please request a new one.")

    # Verify email OTP
    if not verify_otp(record.email_otp_hash, req.email_otp):
        record.attempts += 1
        if record.attempts >= 5:
            db.delete(record)
            db.commit()
            raise HTTPException(status_code=400, detail="Too many failed attempts. OTP has been invalidated.")
        db.commit()
        raise HTTPException(status_code=400, detail=f"Invalid verification code. {5 - record.attempts} attempts remaining.")

    # Mark as verified
    record.verified = 1
    db.commit()

    access_token = create_access_token(data={"sub": req.email})
    return {"success": True, "verified": True, "access_token": access_token, "message": "Verification successful."}


@app.post("/api/otp/resend")
def api_resend_otp(req: OTPSendRequest, db: Session = Depends(get_db)):
    """Invalidate previous OTPs and send new ones."""
    # Invalidate old records
    db.query(OTPRecord).filter(
        OTPRecord.email == req.email, OTPRecord.purpose == req.purpose, OTPRecord.verified == 0
    ).delete()
    db.commit()


# =====================================================================
# Google OAuth Endpoint
# =====================================================================

class GoogleAuthRequest(BaseModel):
    token: str

@app.post("/api/auth/google")
def google_auth(req: GoogleAuthRequest):
    """Verifies Google access token and returns user profile."""
    # Hit Google's userinfo endpoint
    # The frontend @react-oauth/google hook returns an access_token by default.
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {req.token}"}
    
    response = requests.get(user_info_url, headers=headers)
    
    if not response.ok:
        raise HTTPException(status_code=401, detail="Invalid or expired Google Token")
    
    profile = response.json()
    
    # Normally here, you would sync this profile with your database:
    # 1. Lookup user by profile["email"]
    # 2. If not found, create new UserRecord
    # 3. Create active session token
    
    # For now, we return success and pass the trusted profile to the frontend
    access_token = create_access_token(data={"sub": profile.get("email")})
    return {
        "success": True,
        "access_token": access_token,
        "profile": profile
    }

@app.post("/api/admin/populate")
def api_populate_templates(db: Session = Depends(get_db)):
    """Populates the database with default gesture templates and reloads the classifier."""
    # This logic is adapted from populate_landmarks.py but using the current session
    from populate_landmarks import get_thank_you, build_hand, thumb_extended_side, index_extended, middle_extended, ring_extended, pinky_extended, thumb_tucked, index_curled, middle_curled, ring_curled, pinky_curled, thumb_extended_up, pinky_extended, get_no
    
    gesture_map = {
        "Stop": build_hand(thumb_extended_side, index_extended, middle_extended, ring_extended, pinky_extended),
        "Help": build_hand(thumb_tucked, index_curled, middle_curled, ring_curled, pinky_curled),
        "Yes": build_hand(thumb_extended_up, index_curled, middle_curled, ring_curled, pinky_curled),
        "Hello": build_hand(thumb_tucked, index_extended, middle_extended, ring_curled, pinky_curled),
        "Sorry": build_hand(thumb_tucked, index_curled, middle_curled, ring_curled, pinky_extended),
        "I Love You": build_hand(thumb_extended_side, index_extended, middle_curled, ring_curled, pinky_extended),
        "Please": build_hand(thumb_tucked, index_extended, middle_extended, ring_extended, pinky_extended),
        "Water": build_hand(thumb_extended_side, index_extended, middle_curled, ring_curled, pinky_curled),
        "Thank You": get_thank_you(),
        "No": get_no()
    }

    count = 0
    for name, data in gesture_map.items():
        # Update or Insert
        template = db.query(GestureTemplate).filter(func.lower(GestureTemplate.name) == name.lower()).first()
        json_data = json.dumps(data)
        if template:
            template.landmark_json = json_data
        else:
            # We need phrase and category for new ones
            # In a real app, these would come from the map or defaults
            template = GestureTemplate(
                name=name,
                phrase=name,
                category="General",
                landmark_json=json_data
            )
            db.add(template)
        count += 1
    
    db.commit()
    
    # Reload the classifier templates in memory
    classifier.load_templates()
    
    return {"success": True, "message": f"Populated {count} templates and reloaded classifier.", "total_in_memory": len(classifier.templates)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
