import json
import re
from groq import Groq
from src.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def _build_parser_prompt(raw_ocr_text: str, num_questions: int) -> str:
    return f"""You are a strict answer-sheet parser for a multiple-choice English test.

The raw OCR text below was scanned from a student's answer sheet. Your job is to:
1. Identify the student's selected answer for each question (usually a letter: A, B, C, or D).
2. Return ONLY a valid JSON array of exactly {num_questions} items.
3. Each item must be an integer index: 0 for A, 1 for B, 2 for C, 3 for D.
4. If you cannot determine the answer for a question, use -1 (meaning "unanswered").
5. Do NOT include any explanation, markdown, or text outside the JSON array.

Example output for 5 questions:
[0, 2, 1, 3, -1]

RAW OCR TEXT:
\"\"\"
{raw_ocr_text}
\"\"\"

Return only the JSON array for {num_questions} questions."""


def parse_answers_with_llm(raw_ocr_text: str, num_questions: int) -> list[int]:
    """
    Use the Groq LLM to parse raw OCR text into a list of integer answer indices.
    Returns a list of length num_questions, each value 0-3 or -1 for unanswered.
    """
    prompt = _build_parser_prompt(raw_ocr_text, num_questions)

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict JSON answer extractor. Only output valid JSON, nothing else.",
                },
                {"role": "user", "content": prompt},
            ],
            model=settings.GROQ_MODEL,
            temperature=0,
            max_tokens=512,
        )
        content = response.choices[0].message.content.strip()

        # Robustly extract JSON array even if LLM adds extra text
        match = re.search(r"\[[\s\S]*\]", content)
        if not match:
            raise ValueError(f"LLM did not return a JSON array. Got: {content}")

        parsed = json.loads(match.group())

        # Validate and pad/trim to num_questions
        validated = []
        for i in range(num_questions):
            if i < len(parsed) and isinstance(parsed[i], int) and parsed[i] in range(-1, 4):
                validated.append(parsed[i])
            else:
                validated.append(-1)
        return validated

    except Exception as e:
        print(f"[GradingService] LLM parsing error: {e}")
        # Return all unanswered on failure
        return [-1] * num_questions


def grade(
    student_answers: list[int],
    correct_answers: list[int],
    total_score: int,
) -> dict:
    """
    Compare student answers vs correct answers.
    Returns detailed grading result.
    """
    num_questions = len(correct_answers)
    correct_count = 0
    details = []

    for i, (student, correct) in enumerate(zip(student_answers, correct_answers)):
        is_correct = student == correct
        if is_correct:
            correct_count += 1
        details.append(
            {
                "question": i + 1,
                "student_answer": student,  # 0-3 or -1
                "correct_answer": correct,
                "is_correct": is_correct,
            }
        )

    score_per_question = total_score / num_questions if num_questions > 0 else 0
    raw_score = round(correct_count * score_per_question, 2)
    percentage = round((correct_count / num_questions) * 100, 1) if num_questions > 0 else 0

    return {
        "total_questions": num_questions,
        "correct_count": correct_count,
        "wrong_count": num_questions - correct_count,
        "unanswered_count": sum(1 for a in student_answers if a == -1),
        "raw_score": raw_score,
        "total_score": total_score,
        "percentage": percentage,
        "details": details,
    }
