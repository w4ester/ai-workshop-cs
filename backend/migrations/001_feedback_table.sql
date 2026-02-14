-- 001: Feedback table for BEADS integration
-- Safe to re-run (all IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    page_url TEXT,
    feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('general', 'suggestion', 'bug', 'question')),
    ip_address TEXT,
    user_agent TEXT,
    beads_issue_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_beads ON feedback(beads_issue_id);
