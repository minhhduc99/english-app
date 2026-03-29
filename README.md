# 📑 System Architecture Specification: EduLMS & AI Service

## 1. High-Level Architecture

The system follows a **Decoupled Microservices** pattern to isolate heavy AI computations from core business logic.

- **Core LMS Service (NestJS):** Handles Auth, Class Management, Attendance, and Gamification.
- **AI Microservice (FastAPI):** Handles OCR, PDF Text Extraction, Embedding (RAG), and Real-time Voice Chat.
- **Message Queue (Redis/BullMQ):** Acts as the asynchronous backbone. All heavy tasks (PDF processing, Audio analysis) are queued to prevent blocking the main event loop.
- **Storage (Garage S3):** A lightweight, distributed S3-compatible object store used for all binary assets (PDFs, Images, Audio).

## 2. Database Schema (PostgreSQL 15+)

We use **Polyglot Persistence**: PostgreSQL for relational data, Pinecone for Vector data, and Redis for Caching/Queueing.

### 2.1. Authentication & Profiles (Normalized)

| Table | Fields | Note |
|---|---|---|
| accounts | id (UUID PK), username, password_hash, role | role: ADMIN, MANAGER, TEACHER, STUDENT |
| user_profiles | user_id (FK), full_name, avatar_url, email, phone | Separated for performance and security |

### 2.2. Operations & Attendance (Partitioned)

| Table | Fields | Strategy |
|---|---|---|
| classes | id, name, manager_id (FK), teacher_id (FK) | Core class metadata |
| class_members | student_id (FK), class_id (FK), status | Maps students to classes |
| attendance | id (BIGINT), student_id, class_id, date, status | Range Partitioning by date (Yearly/Monthly) |
| attendance_logs | att_id, old_status, new_status, updated_by | Audit trail for modifications |

### 2.3. Learning Materials & AI Knowledge

| Table | Fields | Note |
|---|---|---|
| lessons | id, class_id, title, description | Lesson metadata |
| media_assets | id, lesson_id, file_url, file_type, is_synced | Managed in Garage S3. `is_synced` flags AI readiness |
| vocabularies | id, lesson_id, word, ipa, definition | Target data for Flashcards and AI prompts |

### 2.4. AI Conversations (Real-time & Partitioned)

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
│   ├── config/              # Env validation & configs (database, redis, s3)
│   ├── modules/
│   │   ├── users/           # Separate Accounts/Profiles logic
│   │   ├── attendance/      # Handles partitioned table interaction
│   │   ├── lessons/         # Manages course material & interacts with Garage S3
│   │   ├── queue/           # BullMQ Producer (Document heavy lifting)
│   │   └── webhooks/        # Endpoint to receive responses from AI Service
│   └── common/
├── docker-compose.yml       # (Local dev if needed)
├── Dockerfile
├── package.json
└── tsconfig.json
```

### AI Service (FastAPI)

```text
ai-service/
├── src/
│   ├── main.py              # Uvicorn entry point
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/   # REST endpoints
│   │   │   └── websockets/  # Real-time TTS/STT Voice Chat tunnels
│   ├── core/
│   │   ├── config.py        # Pydantic BaseSettings
│   ├── services/
│   │   ├── ocr_service.py   # OCR Text Extraction
│   │   ├── chunker.py       # Text Chunking logic
│   │   ├── voice.py         # TTS/STT integration
│   │   └── rag_engine.py    # Pinecone Vector DB operations
│   ├── workers/
│   │   └── redis_consumer.py# Redis queue consumer for heavy async processing
│   └── utils/
│       └── s3_client.py     # Download/Upload from/to Garage S3
├── requirements.txt
└── Dockerfile
```
