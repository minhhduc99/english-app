-- 02-courses.sql
-- =========================================================
-- Courses Table
-- Stores course information managed by ADMIN / MANAGER roles
-- =========================================================

-- Create custom ENUM types for course level and status
DO $$ BEGIN
  CREATE TYPE course_level AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    level course_level NOT NULL DEFAULT 'BEGINNER',

    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    study_schedule TEXT NOT NULL,          -- e.g. "Mon, Wed, Fri 18:00-20:00"

    -- Capacity
    max_attendants INT NOT NULL DEFAULT 30,

    -- Details
    description TEXT,
    status course_status NOT NULL DEFAULT 'DRAFT',

    -- Audit
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_course_dates CHECK (end_date > start_date),
    CONSTRAINT chk_max_attendants CHECK (max_attendants > 0 AND max_attendants <= 500)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
