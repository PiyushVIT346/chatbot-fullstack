"""
Database configuration and session management.
Provides database engine and session factory.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base

# 1. Get the Database URL from environment, or use local SQLite as fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///chatbot.db")

# 2. Fix for Render/Neon using 'postgres://' which SQLAlchemy 1.4+ dislikes
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Configure connection arguments based on database type
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific setting for multi-threaded access
    connect_args = {"check_same_thread": False}

# 4. Create the engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# 5. Create Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def init_db():
    """Initialize database tables."""
    # This creates tables if they don't exist
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    Get database session with automatic cleanup.
    Used as a FastAPI dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()