import cv2
import mediapipe as mp
import threading
import time
import asyncio
from gesture_classifier import GestureClassifier
from websocket_manager import manager
from tts_handler import TTSHandler

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

class CameraHandler:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.thread = None
        self.classifier = GestureClassifier()
        self.tts = TTSHandler()
        self.last_detection_time = 0
        self.cooldown = 2.0
        self.source = 0

    def start(self, source=0):
        if self.is_running:
            return
        
        self.source = source
        self.cap = cv2.VideoCapture(source)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        self.is_running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
            self.cap = None

    def _run(self):
        # Create a new event loop for this thread to process web socket broadcasts safely if needed
        # but since we are broadcasting via asyncio.run context, we can just do that.
        
        with mp_hands.Hands(
            model_complexity=0,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7) as hands:
            
            while self.is_running:
                success, image = self.cap.read()
                if not success:
                    time.sleep(0.1)
                    continue

                # Mirror flip for natural interaction
                image = cv2.flip(image, 1)
                
                # To improve performance, optionally mark the image as not writeable
                image.flags.writeable = False
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = hands.process(image_rgb)
                
                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        # Convert to list of lists [x, y, z]
                        landmarks = []
                        for lm in hand_landmarks.landmark:
                            landmarks.append([lm.x, lm.y, lm.z])
                            
                        # Classify gesture
                        result = self.classifier.classify(landmarks)
                        
                        if result:
                            # Debounce based on cooldown and websocket broadcast
                            current_time = time.time()
                            if current_time - self.last_detection_time > self.cooldown:
                                self.last_detection_time = current_time
                                
                                # Send via websocket
                                message = {
                                    "phrase": result["phrase"],
                                    "confidence": result["confidence"],
                                    "category": result["category"],
                                    "gesture_id": result["gesture_id"],
                                    "landmarks": landmarks,
                                    "timestamp": current_time
                                }
                                
                                # Broadcast async
                                try:
                                    loop = asyncio.get_event_loop()
                                    if loop.is_running():
                                        asyncio.run_coroutine_threadsafe(manager.broadcast(message), loop)
                                    else:
                                        print("Event loop not running, skipping broadcast")
                                except Exception as e:
                                    print(f"Error broadcasting: {e}")
                                    
                                # Trigger TTS
                                self.tts.speak(result["phrase"])
                                break # only process one hand for debounced detection
                                
                time.sleep(1/30) # Maintain ~30fps frame reading

camera_handler = CameraHandler()
