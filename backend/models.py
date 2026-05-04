import datetime
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    role = Column(String, default="Standard User")  # Standard User, Administrator, Lead Administrator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DetectionHistory(Base):
    __tablename__ = "detection_history"
    id = Column(Integer, primary_key=True, index=True)
    phrase = Column(String, index=True)
    confidence = Column(Float)
    category = Column(String)
    platform = Column(String)
    gesture_id = Column(String, index=True)
    session_id = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Tutorial(Base):
    __tablename__ = "tutorials"
    id = Column(Integer, primary_key=True, index=True)
    youtube_url = Column(String)
    title = Column(String)
    description = Column(Text)
    difficulty = Column(String)
    order_index = Column(Integer)
    thumbnail_url = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class GestureTemplate(Base):
    __tablename__ = "gesture_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    phrase = Column(String)
    category = Column(String)
    difficulty = Column(String)
    landmark_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String)
    priority = Column(String)
    subject = Column(String)
    description = Column(Text)
    status = Column(String, default="Open") # Open, Resolved, Pending
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
class TicketReply(Base):
    __tablename__ = "ticket_replies"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer) # Linked to SupportTicket.id
    author = Column(String) # e.g. "Support Lead" or "System"
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OTPRecord(Base):
    __tablename__ = "otp_records"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    email_otp_hash = Column(String)
    phone_otp_hash = Column(String, nullable=True)
    purpose = Column(String, default="register")  # register, forgot_password
    verified = Column(Integer, default=0)  # 0=pending, 1=verified
    attempts = Column(Integer, default=0)  # to prevent brute force
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    action = Column(String)
    status = Column(String, default="Success")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
