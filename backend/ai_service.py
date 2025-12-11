"""
AI model service using Google Gemini API.
Handles API configuration and text generation.
"""
import os
import logging
import google.generativeai as genai
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotAI:
    """Wrapper for Google Gemini API."""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash-lite"):
        """
        Initialize Gemini API client.
        
        Args:
            api_key: Google API key (if not provided, reads from GEMINI_API_KEY env var)
            model_name: Model to use. Options:
                - "gemini-1.5-flash-latest" (Fast, cost-effective)
                - "gemini-1.5-pro-latest" (More capable, slower)
                - "gemini-2.0-flash-exp" (Experimental, latest)
        """
        self.model_name = model_name
        self.model = None
        self._configure_api(api_key)
    
    def _configure_api(self, api_key: Optional[str] = None):
        """Configure the Gemini API with the provided or environment API key."""
        try:
            # Get API key from parameter or environment variable
            api_key = api_key or os.getenv("GEMINI_API_KEY")
            
            if not api_key:
                logger.error("No API key provided. Set GEMINI_API_KEY environment variable.")
                return
            
            # Configure the API
            genai.configure(api_key=api_key)
            
            # Initialize the model
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            logger.info(f"Gemini API configured successfully with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to configure Gemini API: {e}")
            self.model = None
    
    def _format_chat_history(self, chat_history: List[Dict]) -> List[Dict]:
        """
        Format chat history for Gemini API.
        
        Gemini expects history in format:
        [
            {"role": "user", "parts": ["message"]},
            {"role": "model", "parts": ["response"]},
        ]
        """
        formatted_history = []
        
        for msg in chat_history:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # Convert 'assistant' to 'model' for Gemini
            if role == 'assistant':
                role = 'model'
            
            formatted_history.append({
                "role": role,
                "parts": [content]
            })
        
        return formatted_history
    
    def generate_response(
        self, 
        user_message: str, 
        chat_history: Optional[List[Dict]] = None, 
        max_length: int = 2048
    ) -> str:
        """
        Generate a response using Gemini API.
        
        Args:
            user_message: The user's message
            chat_history: Previous conversation history
            max_length: Maximum tokens in response (not used directly, set in config)
            
        Returns:
            Generated response string
        """
        if not self.model:
            return "Gemini API is not configured. Please check your API key and server logs."
        
        try:
            # Format chat history for Gemini
            formatted_history = []
            if chat_history:
                # Limit to last 10 messages to manage context window
                formatted_history = self._format_chat_history(chat_history[-10:])
            
            # Start a chat session with history
            chat = self.model.start_chat(history=formatted_history)
            
            # Generate response
            response = chat.send_message(user_message)
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            
            # Handle specific API errors
            if "API key" in str(e):
                return "API key error. Please check your Gemini API key configuration."
            elif "quota" in str(e).lower():
                return "API quota exceeded. Please try again later."
            else:
                return "I apologize, but I encountered an error processing your request."

# Initialize the chatbot AI service
try:
    chatbot_ai = ChatbotAI()
except Exception as e:
    logger.error(f"Critical Error initializing ChatbotAI: {e}")
    chatbot_ai = None