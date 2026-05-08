from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from src.services.rag_engine import rag_engine

router = APIRouter()

class VocabularyItem(BaseModel):
    word: str
    definition: Optional[str] = None
    example: Optional[str] = None

class TrainVocabulariesRequest(BaseModel):
    vocabularies: List[VocabularyItem]

@router.post("/train/vocabularies")
async def train_vocabularies(request: TrainVocabulariesRequest):
    try:
        vocab_list = [v.model_dump() for v in request.vocabularies]
        success = rag_engine.train_vocabularies(vocab_list)
        if success:
            return {"message": "Vocabularies trained successfully", "count": len(vocab_list)}
        else:
            raise HTTPException(status_code=500, detail="Failed to save vocabularies to disk")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
