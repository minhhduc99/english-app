from fastapi import APIRouter
from src.api.v1.endpoints import chat, knowledge, ocr

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
