import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Fallback to local sqlite if DATABASE_URL is not set for simpler local testing without docker
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./signetra_local.db")

# For sqlite we need connect_args to avoid thread issues, but postgres doesn't like it.
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
