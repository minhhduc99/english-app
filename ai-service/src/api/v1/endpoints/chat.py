from fastapi import APIRouter, HTTPException
from src.api.v1.endpoints.schemas import ChatRequest, ChatResponse
from src.services.ai_tutor import AITutorService

router = APIRouter()
ai_tutor = AITutorService()

@router.post("/tutor", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest):
    try:
        history = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
        
        reply = await ai_tutor.get_chat_response(
            message=request.message,
            conversation_history=history
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
