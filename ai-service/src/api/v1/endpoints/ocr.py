from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List
import json

from src.services.ocr_service import extract_text
from src.services.grading_service import parse_answers_with_llm, grade

router = APIRouter()


class GradeTestResponse(BaseModel):
    ocr_text: str
    student_answers: List[int]
    total_questions: int
    correct_count: int
    wrong_count: int
    unanswered_count: int
    raw_score: float
    total_score: int
    percentage: float
    details: List[dict]


@router.post("/grade-test", response_model=GradeTestResponse, tags=["OCR Grading"], summary="Scan and grade student answer sheets")
async def grade_test(
    file: UploadFile = File(..., description="Student's answer sheet (PDF or image)"),
    correct_answers: str = Form(..., description="JSON array of correct answer indices, e.g. [0,2,1,3]"),
    total_score: int = Form(100, description="Maximum score for the test"),
):
    """
    Scan a student's answer sheet (PDF/image) using EasyOCR,
    clean the extracted text with an LLM, and grade against the teacher's answer key.
    """
    # 1. Validate correct_answers JSON
    try:
        answers_list: list[int] = json.loads(correct_answers)
        if not isinstance(answers_list, list) or not all(isinstance(a, int) for a in answers_list):
            raise ValueError("correct_answers must be a JSON array of integers")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=422, detail=f"Invalid correct_answers: {e}")

    num_questions = len(answers_list)
    if num_questions == 0:
        raise HTTPException(status_code=422, detail="correct_answers cannot be empty")

    # 2. Read uploaded file
    filename = file.filename or "upload.png"
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    # 3. OCR extraction
    try:
        raw_text = extract_text(file_bytes, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {e}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from the file")

    # 4. LLM answer parsing
    student_answers = parse_answers_with_llm(raw_text, num_questions)

    # 5. Grade
    result = grade(student_answers, answers_list, total_score)

    return GradeTestResponse(
        ocr_text=raw_text,
        student_answers=student_answers,
        **result,
    )
