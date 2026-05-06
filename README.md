# 📑 System Architecture Specification: EduLMS & AI Service

## 1. High-Level Architecture

The system follows a **Decoupled Microservices** pattern to isolate heavy AI computations from core business logic.

- **Core LMS Service (NestJS):** Handles Auth, Class Management, Attendance, Flashcards, English Games, and Gamification.
- **AI Microservice (FastAPI):** Handles OCR, PDF Text Extraction, Embedding (RAG), and Real-time Voice Chat.
- **Message Queue (Redis/BullMQ):** Acts as the asynchronous backbone. All heavy tasks (PDF processing, Audio analysis) are queued to prevent blocking the main event loop.
- **Storage (Garage S3):** A lightweight, distributed S3-compatible object store used for all binary assets (PDFs, Images, Audio).

## 2. Database Schema (PostgreSQL 15+)

We use **Polyglot Persistence**: PostgreSQL for relational data, Pinecone for Vector data, and Redis for Caching/Queueing.

### 2.1. Authentication & Profiles (Normalized)

| Table | Fields | Note |
|---|---|---|
| users | id (UUID PK), username, password, fullName, email, role | **Normalized**: Identity and Auth only. |
| student_stats| id, user_id (FK), xp, coins, lastDailyGameAt, streakDays | **Decoupled**: Only for Students. Tracks progression and rewards. |

### 2.2. Operations & Attendance (Partitioned)

| Table | Fields | Strategy |
|---|---|---|
| classes | id, name, manager_id (FK), teacher_id (FK) | Core class metadata |
| class_members | student_id (FK), class_id (FK), status | Maps students to classes |
| attendance | id (BIGINT), student_id, class_id, date, status | Range Partitioning by date (Yearly/Monthly) |
| attendance_logs | att_id, old_status, new_status, updated_by | Audit trail for modifications |

### 2.3. Courses Management

| Table | Fields | Note |
|---|---|---|
| courses | id (UUID PK), name, course_code (UNIQUE), level, start_date, end_date, study_schedule, max_attendants, description, status, created_by (FK) | **Level**: BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED. **Status**: DRAFT, ACTIVE, COMPLETED, CANCELLED |

### 2.4. Learning Materials & AI Knowledge

| Table | Fields | Note |
|---|---|---|
| lessons | id, class_id, title, description | Lesson metadata |
| media_assets | id, lesson_id, file_url, file_type, is_synced | Managed in Garage S3. `is_synced` flags AI readiness |
| vocabularies | id, lesson_id, word, ipa, definition, example | Target data for Flashcards and English Games |

### 2.5. AI Conversations (Real-time & Partitioned)

| Table | Fields | Strategy |
|---|---|---|
| ai_conversations | id (UUID), student_id, lesson_id, created_at | Session metadata |
| ai_messages | id (BIGINT), conv_id (FK), role, content | Hash Partitioning by `conv_id` |

## 3. Storage & AI Data Pipeline (Garage S3 & RAG)

### 3.1. Why Garage S3?

We replace MinIO with **Garage S3** for its lightweight distributed nature, making it ideal for 2-person dev teams and edge deployments.

- **Bucket:** `lesson-materials` (PDF/Images)
- **Bucket:** `audio-logs` (Student voice recordings)

### 3.2. Asynchronous RAG Pipeline

1. **Upload:** Teacher uploads PDF -> Core Service saves to Garage S3 -> Pushes `Process_PDF` job to Redis.
2. **Worker:** AI Service (FastAPI) pulls the job -> Downloads from Garage S3 -> Chunking (1000 chars with 10% overlap).
3. **Embedding:** Text chunks are converted to vectors and stored in Pinecone/Milvus.
4. **Callback:** AI Service triggers a Webhook to Core Service to set `is_synced_ai = true`.

## 4. Real-time Communication (WebSocket)

For the **AI Speaking Hub**, we utilize **WebSockets (WS)** for low-latency full-duplex communication:

- **Audio Streaming:** Client streams audio chunks (20ms-40ms) directly to the AI Microservice.
- **Processing:** AI Service runs STT -> Vector Search -> LLM -> TTS in a streaming pipeline.
- **Feedback:** AI voice is streamed back to the client immediately without waiting for the full sentence generation.

## 5. Technical Decision: Why No Kafka?

We explicitly exclude Kafka to keep the infrastructure lean:

- **Overhead:** Kafka requires high RAM and complex ZooKeeper/KRaft management.
- **Redis Priority:** Redis + BullMQ provides reliable job queueing with retry logic, which is sufficient for our current load.
- **Maintenance:** A 2-person team should focus on AI Logic rather than distributed cluster orchestration.

## 6. Project Folder Structure

### Core Service (NestJS)

```text
core-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── users/           # Separate Accounts/Profiles logic + Gamification stats
│   │   ├── attendance/      # Handles partitioned table interaction
│   │   ├── courses/         # Course CRUD management (ADMIN/MANAGER)
│   │   ├── lessons/         # Manages course material & interacts with Garage S3
│   │   ├── vocabularies/    # Flashcard and Vocabulary CRUD
│   │   ├── games/           # Educational Games logic (Scramble, Sentence Master, Daily Secret)
│   │   └── webhooks/        # Endpoint to receive responses from AI Service
│   └── common/
```

## 7. API Endpoints & Security

### 7.1. Authentication Flow
Authentication is handled via role-based access control. Valid roles: `ADMIN`, `TEACHER`, `STUDENT`, `MANAGER`.

- **Login:** `POST /api/auth/login`
- **Me:** `GET /api/auth/me` - Returns profile including `xp` and `coins`.

### 7.2. Learning Materials API (MaterialsModule)
Management of global resources (PDF, DOCX, etc).

- **Upload:** `POST /api/materials/upload`
- **Download:** `GET /api/materials/download/:id`
- **Delete:** `DELETE /api/materials/:id`

### 7.3. Vocabularies & Flashcards API
- **List All:** `GET /api/vocabularies` (Supports `?topic=` filter)
- **Topics:** `GET /api/vocabularies/topics` - Returns distinct topics
- **Create:** `POST /api/vocabularies` (Teacher/Admin only) - Supports `topic` and `imageUrl`
- **Delete:** `DELETE /api/vocabularies/:id`

### 7.4. English Games API
- **Word Scramble:** `GET /api/games/scramble?count=5`
- **Verify Answer:** `POST /api/games/scramble/verify`
- **Available Games**: 
  - **Sentence Master**: Interactive grammar builder using example sentences (Ready).
  - **Word Scramble**: Spelling practice with hints (Ready).
  - **Memory Match**: Vocabulary-definition pairing challenge (Ready).
  - **Mystery Market**: Premium storefront for virtual and real-world reward redemption (Ready).
  - **Listen & Type**: Coming Soon.

### 7.5. Gamification & Progression
The system utilizes a prestige-based leveling engine to drive student engagement.
- **XP Engine**: Level = `floor(XP / 1000) + 1`. Total XP is cumulative, while Level identifies academic rank.
- **Mystery Market**: `GET /api/secret-store` (Coming Soon) - A dedicated exchange where students spend **EduCoins** on legendary avatars, XP boosts, or physical vouchers.
- **Daily Secret Challenge**: High-reward personalized task.
  - **Get Daily:** `GET /api/games/daily`
  - **Verify Daily:** `POST /api/games/daily/verify`
    - Awards random **XP (50-100)** and **Coins (10-30)**.
    - Updates `lastDailyGameAt` in `student_stats`.

### 7.6. AI Learning Services API (AI Microservice)
The standalone AI microservice powered by FastApi and Groq API.
- **Chat Tutor:** `POST /api/v1/chat/tutor` - Allows students to converse with an AI tutor (supports context history and English/Vietnamese).

## 8. Localization (i18n)
The system supports full real-time language switching:
- **Languages**: English (`en`), Vietnamese (`vi`).
- **Scope**: All UI labels, menu titles, instructional text, feedback messages, and game roadmaps.
- **Storage**: User preference persisted via `localStorage`.

## 9. Running the Services (Development)

### 9.1. Infrastructure
```bash
docker compose up -d # PostgreSQL, Redis, Garage S3
```

### 9.2. Core Service (NestJS)
```bash
cd core-service/src
npm install
npm run start:dev
```

### 9.3. React Client (Vite)
```bash
cd client
npm install
npm run dev
```

# Next plan
1. **Audio Integration**: Add Text-to-Speech (TTS) for vocabulary pronunciation.
2. **Leaderboard**: Implement a global leaderboard based on XP and Coins.
3. **Advanced Games**: Complete "Memory Match" and "Listen & Type" implementations.