# 🌟 EduLMS - Developed Features

This document outlines the core features that have been developed and integrated into the EduLMS platform.

## 🎓 1. Core Learning & Management
- **Role-based Dashboards:** Dedicated and personalized dashboards for Students, Teachers, and Admins.
- **Course Management:** 
  - Create and manage courses with specific levels, schedules, and capacities.
  - Assign teachers and enroll students.
  - Track course status (Draft, Active, Completed).
- **Attendance System:**
  - Direct daily attendance checklists (Present, Absent, Late).
  - Bulk import attendance records via Excel (`.xlsx`, `.xls`).
  - View attendance history and export monthly reports.
- **Learning Materials Library:**
  - Upload and manage course files (PDFs, Images, Docs) up to 50MB.
  - Dedicated categorization (General, Flashcards, Games).

## 🤖 2. AI-Powered Tools
- **AI Learning Assistant (Trợ lý học tập):**
  - **Real-time Speaking Practice:** Stream audio via WebSockets for instant pronunciation feedback and conversational practice.
  - **Writing Practice:** Chat with specialized AI personas (e.g., IELTS Coach, Strict Tutor).
- **OCR Auto-Grading (Scan & Grade):**
  - Teachers can upload physical answer sheets (PDF/Images).
  - The system uses EasyOCR and AI to scan handwritten/selected answers and automatically grades them against an answer key.
- **Dynamic AI Context Sync:** Automatically syncs course vocabularies to the AI microservice to ensure the AI Tutor understands specific lesson context.

## 🎮 3. Interactive English Games & Gamification
- **Vocabulary Flashcards:** Interactive flip cards with phonetic (IPA) and example sentences.
- **Word Scramble:** Unscramble letters to find the correct vocabulary word.
- **Sentence Master:** Arrange mixed-up words into grammatically correct sentences.
- **Translation Master:** Test vocabulary recall between English and Vietnamese.
- **Daily Secret Challenge:** A 24-hour rotating quest for bonus rewards.
- **Economy System:** Earn **XP** to level up and **Coins** to spend in the Mystery Market.
- **Vocabulary Racing (Đua Xe Gõ Chữ):** A high-speed typing game where players choose a racer (Racing Boy or Racing Girl) and unscramble letter tiles to type vocabulary words under a timer. Features non-negative score clamping (penalized scores never drop below 0), and random bonus questions (`x2`, `x3`, `+100`, `+200`) with animated badges and multiplier rewards.

## 🌍 4. System & Platform Features
- **Bilingual Support (i18n):** Full interface switching between **English** and **Vietnamese** without reloading.
- **Decoupled Architecture:** 
  - Heavy AI tasks (Audio/OCR) run asynchronously on a Python/FastAPI microservice.
  - Core business logic runs on a fast Node.js/NestJS backend.
- **Optimized Concurrency:** Configured with Node.js PM2 clustering and Uvicorn multi-workers to support high concurrency.
- **Distributed Storage:** Integration with Garage S3 for lightweight, scalable storage of media assets.
