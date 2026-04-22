import json
import math
import os
import glob
from typing import Dict, Any, List

class GestureClassifier:
    def __init__(self):
        self.templates: Dict[str, List[float]] = {}
        self.phrases: Dict[str, str] = {}
        self.categories: Dict[str, str] = {}
        self.load_templates()

    def load_templates(self):
        # Load all JSON files from gestures directory
        template_dir = os.path.join(os.path.dirname(__file__), "gestures", "templates")
        if not os.path.exists(template_dir):
            os.makedirs(template_dir, exist_ok=True)
            self._create_mock_gestures(template_dir)

        for filename in glob.glob(os.path.join(template_dir, "*.json")):
            with open(filename, "r") as f:
                data = json.load(f)
                name = data["name"]
                self.phrases[name] = data["phrase"]
                self.categories[name] = data["category"]
                
                # Assume landmarks are stored as [{"x": _, "y": _, "z": _}, ...]
                raw_landmarks = [[lm["x"], lm["y"], lm["z"]] for lm in data["landmarks"]]
                self.templates[name] = self.normalize_landmarks(raw_landmarks)

    def normalize_landmarks(self, landmarks: List[List[float]]) -> List[float]:
        # wrist is landmarks[0]
        wrist = landmarks[0]
        # translate so wrist is at (0,0,0)
        translated = []
        for lm in landmarks:
            translated.append([lm[0] - wrist[0], lm[1] - wrist[1], lm[2] - wrist[2]])
        
        # calculate palm size (distance from wrist to middle finger mcp - landmarks[9])
        mcp = translated[9]
        palm_size = math.sqrt(mcp[0]**2 + mcp[1]**2 + mcp[2]**2)
        if palm_size == 0:
            palm_size = 1 # avoid division by zero safety constraint
            
        normalized = []
        for lm in translated:
            normalized.append(lm[0] / palm_size)
            normalized.append(lm[1] / palm_size)
            normalized.append(lm[2] / palm_size)
            
        return normalized

    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        dot_product = sum(x*y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x*x for x in a))
        norm_b = math.sqrt(sum(y*y for y in b))
        if norm_a == 0 or norm_b == 0:
            return 0
        return dot_product / (norm_a * norm_b)

    def classify(self, raw_landmarks: List[List[float]]) -> dict:
        normalized = self.normalize_landmarks(raw_landmarks)
        best_match = None
        best_score = 0
        
        for gesture_name, template in self.templates.items():
            score = self.cosine_similarity(normalized, template)
            if score > best_score:
                best_score = score
                best_match = gesture_name
                
        if best_score >= 0.75 and best_match is not None:
            return {
                "phrase": self.phrases[best_match],
                "confidence": round(best_score * 100, 1),
                "category": self.categories[best_match],
                "gesture_id": best_match
            }
        return None

    def _create_mock_gestures(self, template_dir: str):
        # Create the 15 requested gestures if they don't exist
        mock_gestures = [
            {"name": "help", "phrase": "Help", "category": "Emergency", "difficulty": "Hard"},
            {"name": "danger", "phrase": "Danger", "category": "Emergency", "difficulty": "Medium"},
            {"name": "lost", "phrase": "Lost", "category": "Emergency", "difficulty": "Hard"},
            {"name": "ambulance", "phrase": "Ambulance", "category": "Emergency", "difficulty": "Hard"},
            {"name": "doctor", "phrase": "Doctor", "category": "Emergency", "difficulty": "Medium"},
            {"name": "hello_signetra", "phrase": "Hello Signetra", "category": "Greeting", "difficulty": "Easy"},
            {"name": "nice_project", "phrase": "Nice Project", "category": "Greeting", "difficulty": "Medium"},
            {"name": "water", "phrase": "Water", "category": "Basic Need", "difficulty": "Easy"},
            {"name": "food", "phrase": "Food", "category": "Basic Need", "difficulty": "Easy"},
            {"name": "bathroom", "phrase": "Bathroom", "category": "Basic Need", "difficulty": "Medium"},
            {"name": "yes", "phrase": "Yes", "category": "Response", "difficulty": "Easy"},
            {"name": "no", "phrase": "No", "category": "Response", "difficulty": "Easy"},
            {"name": "please", "phrase": "Please", "category": "Response", "difficulty": "Easy"},
            {"name": "thank_you", "phrase": "Thank You", "category": "Response", "difficulty": "Easy"},
            {"name": "dont_understand", "phrase": "I Don't Understand", "category": "Response", "difficulty": "Hard"}
        ]
        
        # mock landmark is just 21 coordinate dicts, with small variations so cosine sim works
        for i, g in enumerate(mock_gestures):
            ld = [{"x": j * 0.1, "y": j * 0.1 + (i*0.01), "z": j * 0.05} for j in range(21)]
            # ensure wrist is origin
            ld[0] = {"x": 0.0, "y": 0.0, "z": 0.0}
            # ensure palm size isn't 0
            ld[9] = {"x": 1.0, "y": 1.0, "z": 1.0}
            
            data = {
                "name": g["name"],
                "phrase": g["phrase"],
                "category": g["category"],
                "difficulty": g["difficulty"],
                "landmarks": ld
            }
            with open(os.path.join(template_dir, f"{g['name']}.json"), "w") as f:
                json.dump(data, f, indent=2)
