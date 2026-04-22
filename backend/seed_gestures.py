from database import SessionLocal
from models import GestureTemplate
import datetime

GESTURES = [
    {"name": "Stop", "phrase": "STOP", "category": "General", "difficulty": "BEGINNER"},
    {"name": "Help", "phrase": "HELP", "category": "Urgent", "difficulty": "URGENT"},
    {"name": "Yes", "phrase": "YES", "category": "Affirmation", "difficulty": "BEGINNER"},
    {"name": "No", "phrase": "NO", "category": "Negation", "difficulty": "BEGINNER"},
    {"name": "Hello", "phrase": "HELLO", "category": "Greeting", "difficulty": "BEGINNER"},
    {"name": "Thank You", "phrase": "THANK YOU", "category": "Social", "difficulty": "INTERMEDIATE"},
    {"name": "Sorry", "phrase": "SORRY", "category": "Social", "difficulty": "BEGINNER"},
    {"name": "I Love You", "phrase": "I LOVE YOU", "category": "Social", "difficulty": "ADVANCED"},
    {"name": "Please", "phrase": "PLEASE", "category": "Social", "difficulty": "INTERMEDIATE"},
    {"name": "Water", "phrase": "WATER", "category": "Needs", "difficulty": "INTERMEDIATE"},
]

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        count = db.query(GestureTemplate).count()
        if count > 0:
            print(f"Database already contains {count} gestures. Skipping seed.")
            return

        for g in GESTURES:
            template = GestureTemplate(
                name=g["name"],
                phrase=g["phrase"],
                category=g["category"],
                difficulty=g["difficulty"],
                landmark_json={}, # Empty for now, as we use heuristics
                created_at=datetime.datetime.utcnow()
            )
            db.add(template)
        
        db.commit()
        print(f"Successfully seeded {len(GESTURES)} gestures.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
