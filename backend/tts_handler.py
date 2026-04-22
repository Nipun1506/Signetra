import edge_tts
import pyttsx3
import threading
import asyncio
import io
import os
import sys

class TTSHandler:
    def __init__(self):
        self.queue = []
        self.is_speaking = False
        self.lock = threading.Lock()
        
        # initialize pyttsx3 fallback
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 150)
            self.use_fallback = False
        except Exception:
            self.use_fallback = True

    def speak(self, text: str):
        with self.lock:
            self.queue.append(text)
            if not self.is_speaking:
                self.is_speaking = True
                threading.Thread(target=self._process_queue, daemon=True).start()

    def _process_queue(self):
        while True:
            with self.lock:
                if not self.queue:
                    self.is_speaking = False
                    break
                text = self.queue.pop(0)

            # Try using async edge_tts via asyncio
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self._edge_tts_speak(text))
                loop.close()
            except Exception as e:
                print(f"edge-tts failed: {e}. using pyttsx3 fallback.")
                if not self.use_fallback:
                    self.engine.say(text)
                    self.engine.runAndWait()

    async def _edge_tts_speak(self, text: str):
        communicate = edge_tts.Communicate(text, "en-US-AriaNeural")
        
        # We need a cross-platform way to play mp3 from python. 
        # For simplicity, edge_tts can just save and afplay (mac) or mpg123 (linux)
        # MacOS default: afplay
        temp_file = "temp_tts.mp3"
        await communicate.save(temp_file)
        if sys.platform == "darwin":
            os.system(f"afplay {temp_file}")
        elif sys.platform == "win32":
            os.system(f"start {temp_file}") # This opens default player, not ideal but fallback exists
        else:
            os.system(f"mpg123 -q {temp_file} 2>/dev/null")
            
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass
