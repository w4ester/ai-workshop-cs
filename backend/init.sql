-- AI Workshop CS — Database Schema
-- Requires: pgvector extension

CREATE EXTENSION IF NOT EXISTS vector;

-- Standards table (both MSDE and CSTA)
CREATE TABLE IF NOT EXISTS standards (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL CHECK (source IN ('msde', 'csta')),
    code TEXT,
    grade_band TEXT,
    category TEXT,
    subcategory TEXT,
    text TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crosswalk mappings between MSDE and CSTA
CREATE TABLE IF NOT EXISTS crosswalk (
    id SERIAL PRIMARY KEY,
    msde_id INTEGER REFERENCES standards(id),
    csta_id INTEGER REFERENCES standards(id),
    alignment TEXT NOT NULL CHECK (alignment IN ('strong', 'partial', 'gap', 'extension')),
    bridge_note TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated lessons
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    grade_band TEXT NOT NULL,
    ai_category TEXT,
    duration_minutes INTEGER DEFAULT 45,
    content JSONB NOT NULL,
    msde_codes TEXT[],
    csta_codes TEXT[],
    output_format TEXT DEFAULT 'markdown',
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_standards_embedding ON standards
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

CREATE INDEX IF NOT EXISTS idx_lessons_embedding ON lessons
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_standards_source ON standards(source);
CREATE INDEX IF NOT EXISTS idx_standards_grade ON standards(grade_band);
CREATE INDEX IF NOT EXISTS idx_crosswalk_alignment ON crosswalk(alignment);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade_band);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(ai_category);
