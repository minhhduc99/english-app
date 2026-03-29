-- 01-init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 2.1 Authentication & Profiles (Normalized)
-- =========================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, MANAGER, TEACHER, STUDENT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================
-- 2.2 Operations & Attendance
-- =========================================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES accounts(id),
    teacher_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE class_members (
    student_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (student_id, class_id)
);

-- Range Partitioned Attendance Table (Partitioned by Year/Month 'date')
CREATE TABLE attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    student_id UUID NOT NULL REFERENCES accounts(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id, date) -- Partition key must be part of PK
) PARTITION BY RANGE (date);

-- Example Partitions for early 2026
CREATE TABLE attendance_2026_03 PARTITION OF attendance FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE attendance_2026_04 PARTITION OF attendance FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE attendance_2026_05 PARTITION OF attendance FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE attendance_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    att_id BIGINT NOT NULL,
    att_date DATE NOT NULL, 
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    updated_by UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- FK constraint must reference the Composite PK of attendance
    CONSTRAINT fk_attendance FOREIGN KEY (att_id, att_date) REFERENCES attendance(id, date) ON DELETE CASCADE
);


-- =========================================================
-- 2.3 Learning Materials & AI Knowledge
-- =========================================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    is_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    ipa VARCHAR(100),
    definition TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =========================================================
-- 2.4 AI Conversations (Real-time & Partitioned)
-- =========================================================
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hash Partitioned AI Messages Table
CREATE TABLE ai_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    conv_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- e.g. 'USER', 'AI'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, conv_id) -- Partition key must be part of PK
) PARTITION BY HASH (conv_id);

-- Example Hash Partitions (split across 4 logical buckets)
CREATE TABLE ai_messages_p0 PARTITION OF ai_messages FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE ai_messages_p1 PARTITION OF ai_messages FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE ai_messages_p2 PARTITION OF ai_messages FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE ai_messages_p3 PARTITION OF ai_messages FOR VALUES WITH (MODULUS 4, REMAINDER 3);
