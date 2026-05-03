import sqlite3
import json
import os

DB_PATH = "/Users/nipun/Desktop/Signetra/backend/signetra_local.db"

WRIST = {"x": 0.5, "y": 0.9}

CMC_T = {"x": 0.4, "y": 0.8}
MCP_I = {"x": 0.4, "y": 0.5}
MCP_M = {"x": 0.5, "y": 0.48}
MCP_R = {"x": 0.6, "y": 0.5}
MCP_P = {"x": 0.7, "y": 0.55}

def thumb_extended_side():
    return [{"x": 0.35, "y": 0.8}, {"x": 0.25, "y": 0.75}, {"x": 0.15, "y": 0.7}, {"x": 0.1, "y": 0.65}]

def thumb_extended_up():
    return [{"x": 0.45, "y": 0.7}, {"x": 0.45, "y": 0.6}, {"x": 0.45, "y": 0.5}, {"x": 0.45, "y": 0.4}]

def thumb_tucked():
    return [{"x": 0.45, "y": 0.8}, {"x": 0.5, "y": 0.75}, {"x": 0.55, "y": 0.75}, {"x": 0.6, "y": 0.75}]

def index_extended():
    return [{"x": 0.4, "y": 0.5}, {"x": 0.4, "y": 0.35}, {"x": 0.4, "y": 0.2}, {"x": 0.4, "y": 0.1}]

def index_curled():
    # Tucked inside the palm
    return [{"x": 0.4, "y": 0.5}, {"x": 0.42, "y": 0.6}, {"x": 0.45, "y": 0.65}, {"x": 0.48, "y": 0.6}]

def middle_extended():
    return [{"x": 0.5, "y": 0.45}, {"x": 0.5, "y": 0.3}, {"x": 0.5, "y": 0.15}, {"x": 0.5, "y": 0.05}]

def middle_curled():
    return [{"x": 0.5, "y": 0.45}, {"x": 0.5, "y": 0.55}, {"x": 0.52, "y": 0.65}, {"x": 0.55, "y": 0.6}]

def ring_extended():
    return [{"x": 0.6, "y": 0.5}, {"x": 0.6, "y": 0.35}, {"x": 0.6, "y": 0.2}, {"x": 0.6, "y": 0.1}]

def ring_curled():
    return [{"x": 0.6, "y": 0.5}, {"x": 0.58, "y": 0.6}, {"x": 0.55, "y": 0.65}, {"x": 0.52, "y": 0.6}]

def pinky_extended():
    return [{"x": 0.7, "y": 0.55}, {"x": 0.7, "y": 0.45}, {"x": 0.7, "y": 0.35}, {"x": 0.7, "y": 0.25}]

def build_hand(thumb, index, middle, ring, pinky):
    return [WRIST] + thumb() + index() + middle() + ring() + pinky()

# Composite states
def get_thank_you(): # OK Sign
    thumb = [{"x": 0.35, "y": 0.65}, {"x": 0.3, "y": 0.5}, {"x": 0.32, "y": 0.4}, {"x": 0.35, "y": 0.4}]
    index = [{"x": 0.35, "y": 0.4}, {"x": 0.3, "y": 0.42}, {"x": 0.32, "y": 0.4}, {"x": 0.35, "y": 0.4}]
    return [WRIST] + thumb + index + middle_extended() + ring_extended() + pinky_extended()

def get_no(): # Hook sign
    thumb = [{"x": 0.35, "y": 0.65}, {"x": 0.4, "y": 0.55}, {"x": 0.45, "y": 0.5}, {"x": 0.48, "y": 0.5}]
    index = [{"x": 0.38, "y": 0.4}, {"x": 0.35, "y": 0.45}, {"x": 0.4, "y": 0.5}, {"x": 0.42, "y": 0.5}]
    middle = [{"x": 0.48, "y": 0.4}, {"x": 0.45, "y": 0.45}, {"x": 0.45, "y": 0.5}, {"x": 0.48, "y": 0.5}]
    return [WRIST] + thumb + index + middle + ring_curled() + pinky_curled()


def run():
    if not os.path.exists(DB_PATH):
        print(f"DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

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

    for name, data in gesture_map.items():
        json_data = json.dumps(data)
        cursor.execute("UPDATE gesture_templates SET landmark_json = ? WHERE name = ? COLLATE NOCASE", (json_data, name))

    conn.commit()
    print(f"Updated {conn.total_changes} rows with specific image landmarks.")
    conn.close()

if __name__ == "__main__":
    run()
