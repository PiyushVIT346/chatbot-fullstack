"""
FastAPI for chatbot application.
Provides endpoints for chat sessions and message management.
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from sqlalchemy import desc
from sqlalchemy.orm import Session
from database import init_db, get_db
from models import ChatSession, Message
from ai_service import chatbot_ai
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chatbot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Pydantic models for request/response
class ChatRequest(BaseModel):
    session_id: int
    message: str

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    timestamp: datetime

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    session_id: int
    role: str
    content: str
    timestamp: datetime


@app.get('/api/sessions')
def get_sessions(db: Session = Depends(get_db)):
    """Get all chat sessions grouped by date."""
    try:
        sessions = db.query(ChatSession).order_by(desc(ChatSession.timestamp)).all()
        
        # Group by date
        grouped = {}
        today = datetime.utcnow().date()
        
        for session in sessions:
            session_date = session.timestamp.date()
            
            if session_date == today:
                key = "Today"
            elif (today - session_date).days == 1:
                key = "Yesterday"
            else:
                key = session_date.strftime("%B %d, %Y")
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(session.to_dict())
        
        return grouped
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/sessions', status_code=201)
def create_session(db: Session = Depends(get_db)):
    """Create a new chat session."""
    try:
        new_session = ChatSession(title="New Chat")
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return new_session.to_dict()
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/sessions/{session_id}')
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get a specific session with all messages."""
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail='Session not found')
        
        messages = [msg.to_dict() for msg in session.messages]
        
        return {
            'session': session.to_dict(),
            'messages': messages
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/sessions/latest')
def get_latest_session(db: Session = Depends(get_db)):
    """Get the most recent chat session."""
    try:
        session = db.query(ChatSession).order_by(desc(ChatSession.timestamp)).first()
        
        if not session:
            # Create first session if none exists
            session = ChatSession(title="New Chat")
            db.add(session)
            db.commit()
            db.refresh(session)
        
        messages = [msg.to_dict() for msg in session.messages]
        
        return {
            'session': session.to_dict(),
            'messages': messages
        }
    except Exception as e:
        logger.error(f"Error fetching latest session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/chat')
def chat(chat_request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process chat message and generate AI response.
    
    Request body:
        {
            "session_id": int,
            "message": str
        }
    """
    try:
        session_id = chat_request.session_id
        user_message = chat_request.message.strip()
        
        if not user_message:
            raise HTTPException(status_code=400, detail='Message cannot be empty')
        
        # Verify session exists
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail='Session not found')
        
        # Save user message
        user_msg = Message(
            session_id=session_id,
            role='user',
            content=user_message
        )
        db.add(user_msg)
        db.commit()
        
        # Get chat history for context
        chat_history = [msg.to_dict() for msg in session.messages[:-1]]
        
        # Generate AI response
        ai_response = chatbot_ai.generate_response(user_message, chat_history)
        
        # Save AI response
        ai_msg = Message(
            session_id=session_id,
            role='assistant',
            content=ai_response
        )
        db.add(ai_msg)
        
        # Update session title based on first message
        if len(session.messages) == 1:
            session.title = user_message[:50] + ("..." if len(user_message) > 50 else "")
        
        db.commit()
        db.refresh(user_msg)
        db.refresh(ai_msg)
        
        return {
            'user_message': user_msg.to_dict(),
            'ai_response': ai_msg.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete('/api/sessions/{session_id}')
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """Delete a chat session and all its messages."""
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail='Session not found')
        
        db.delete(session)
        db.commit()
        
        return {'message': 'Session deleted'}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)