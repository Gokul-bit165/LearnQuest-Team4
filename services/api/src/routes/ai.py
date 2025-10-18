"""
AI Tutor endpoints for Learn Quest.
Provides RAG-based AI tutoring with multimodal support (text and images).
"""

import os
import base64
import time
import requests
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Configuration
CHROMA_HOST = os.getenv("CHROMA_HOST", "chroma")
CHROMA_PORT = os.getenv("CHROMA_PORT", "8000")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")

# Initialize models (lazy loading to avoid startup issues)
embedding_model = None

def get_embedding_model():
    """Get or initialize the embedding model"""
    global embedding_model
    if embedding_model is None:
        print("Loading AI models...")
        # Check if CUDA is available
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)
    return embedding_model

def get_chroma_client():
    """Get ChromaDB client"""
    return chromadb.HttpClient(
        host=CHROMA_HOST,
        port=int(CHROMA_PORT)
    )

def wait_for_chroma(max_retries=10, delay=1):
    """Wait for ChromaDB to be ready"""
    for attempt in range(max_retries):
        try:
            client = get_chroma_client()
            # Try to get server version to test connection
            client.heartbeat()
            return client
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                raise Exception(f"Failed to connect to ChromaDB: {e}")

class ExplainRequest(BaseModel):
    question: str
    course_id: str

class ExplainResponse(BaseModel):
    response: str
    image_url: Optional[str] = None
    sources: List[Dict[str, Any]] = []

@router.post("/explain", response_model=ExplainResponse)
async def explain_concept(
    request: ExplainRequest, 
    current_user: User = Depends(get_current_user)
):
    """
    AI Tutor endpoint that provides explanations using RAG with multimodal support.
    Can handle both text-based and image-based queries.
    """
    try:
        # Get ChromaDB collection
        chroma_client = wait_for_chroma()
        collection = chroma_client.get_collection("learnquest_content")
        
        # Generate embedding for user's question
        embedding_model = get_embedding_model()
        question_embedding = embedding_model.encode(request.question).tolist()
        
        # Query ChromaDB for relevant content
        results = collection.query(
            query_embeddings=[question_embedding],
            n_results=3,
            where={"course_id": request.course_id}
        )
        
        if not results['documents'] or not results['documents'][0]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No relevant content found for this course"
            )
        
        # Get the top result
        top_result = results['metadatas'][0][0]
        top_document = results['documents'][0][0]
        top_distance = results['distances'][0][0]
        
        # Prepare sources for response
        sources = []
        for i, (doc, metadata, distance) in enumerate(zip(
            results['documents'][0], 
            results['metadatas'][0], 
            results['distances'][0]
        )):
            sources.append({
                "content": doc[:200] + "..." if len(doc) > 200 else doc,
                "title": metadata.get("title", "Unknown"),
                "type": metadata.get("type", "unknown"),
                "relevance_score": 1 - distance  # Convert distance to similarity
            })
        
        # Check if the top result is image-based
        if top_result.get("type") == "image":
            return await handle_image_query(request.question, top_result, top_document, sources)
        else:
            return await handle_text_query(request.question, top_document, sources)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI explanation failed: {str(e)}"
        )

async def handle_text_query(question: str, context: str, sources: List[Dict]) -> ExplainResponse:
    """Handle text-based queries using Llama3"""
    try:
        # Prepare prompt for Llama3
        prompt = f"""You are an expert AI tutor for Learn Quest. Answer the student's question based on the provided course content.

Student's Question: {question}

Relevant Course Content:
{context}

Instructions:
- Provide a clear, educational explanation
- Use examples when helpful
- Be encouraging and supportive
- If the content doesn't fully answer the question, acknowledge this and provide what you can
- Keep your response concise but comprehensive

Your Response:"""

        # Call Ollama Llama3 API
        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        result = response.json()
        ai_response = result.get("response", "I'm sorry, I couldn't generate a response.")
        
        return ExplainResponse(
            response=ai_response,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text query processing failed: {str(e)}"
        )

async def handle_image_query(question: str, metadata: Dict, context: str, sources: List[Dict]) -> ExplainResponse:
    """Handle image-based queries using LLaVA"""
    try:
        image_url = metadata.get("image_url")
        if not image_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image URL not found in metadata"
            )
        
        # Download and encode image
        image_response = requests.get(image_url, timeout=30)
        image_response.raise_for_status()
        
        image_base64 = base64.b64encode(image_response.content).decode('utf-8')
        
        # Prepare prompt for LLaVA
        prompt = f"""You are an expert AI tutor. The student is asking: "{question}"

Based on the image provided and the context: "{context}", please provide a helpful educational explanation.

Instructions:
- Analyze the image carefully
- Connect the image content to the student's question
- Provide educational insights about what's shown
- Be encouraging and clear
- If the image doesn't directly relate to the question, explain what you see and how it might be relevant

Your Response:"""

        # Call Ollama LLaVA API
        payload = {
            "model": "llava",
            "prompt": prompt,
            "images": [image_base64],
            "stream": False
        }
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=90
        )
        response.raise_for_status()
        
        result = response.json()
        ai_response = result.get("response", "I'm sorry, I couldn't analyze the image.")
        
        return ExplainResponse(
            response=ai_response,
            image_url=image_url,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image query processing failed: {str(e)}"
        )

@router.get("/health")
async def ai_health_check():
    """Health check for AI services"""
    try:
        # Check ChromaDB connection
        chroma_status = {"connected": False, "embeddings_count": 0}
        try:
            chroma_client = wait_for_chroma()
            collection = chroma_client.get_collection("learnquest_content")
            count = collection.count()
            chroma_status = {"connected": True, "embeddings_count": count}
        except Exception as e:
            chroma_status["error"] = str(e)
        
        # Check Ollama connection
        ollama_status = {"connected": False, "available_models": []}
        try:
            ollama_response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            ollama_models = ollama_response.json().get("models", [])
            ollama_status = {
                "connected": True, 
                "available_models": [model.get("name") for model in ollama_models]
            }
        except Exception as e:
            ollama_status["error"] = str(e)
        
        return {
            "status": "healthy" if chroma_status["connected"] else "degraded",
            "chromadb": chroma_status,
            "ollama": ollama_status
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
