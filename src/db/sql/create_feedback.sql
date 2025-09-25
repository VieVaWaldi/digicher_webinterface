----------------------------
--- Feedback Table
----------------------------

create schema feedback;

SELECT * FROM feedback.feedback_summary;

SELECT * FROM feedback.feedback_v1;

----------------------------
--- Feedback Table Create
----------------------------

CREATE TABLE feedback.feedback_v1 (
    id SERIAL PRIMARY KEY,
    scenario_name TEXT NOT NULL,
    is_useful BOOLEAN NOT NULL,
    usefulness_reason TEXT,
    feedback_improvement_suggestion TEXT,
    user_agent TEXT,
    ip_address TEXT, -- Can be anonymized: "192.168.1.xxx"
    screen_resolution TEXT, -- "1920x1080"
    viewport_size TEXT, -- "1200x800"
    timezone TEXT, -- "Europe/Berlin"
    language TEXT, -- "en-US"
    session_duration_ms INTEGER, -- milliseconds on page
    referrer TEXT, -- where they came from
    page_load_time_ms INTEGER, -- performance metric
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_v1_scenario_name ON feedback.feedback_v1(scenario_name);
CREATE INDEX idx_feedback_v1_submitted_at ON feedback.feedback_v1(submitted_at);
CREATE INDEX idx_feedback_v1_is_useful ON feedback.feedback_v1(is_useful);

----------------------------
--- Feedback Analytics
----------------------------

CREATE VIEW feedback.feedback_summary AS
SELECT 
    scenario_name,
    COUNT(*) as total_feedback,
    COUNT(CASE WHEN is_useful = true THEN 1 END) as useful_count,
    COUNT(CASE WHEN is_useful = false THEN 1 END) as not_useful_count,
    ROUND(
        (COUNT(CASE WHEN is_useful = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as usefulness_percentage,
    DATE_TRUNC('day', submitted_at) as feedback_date
FROM feedback.feedback_v1 
GROUP BY scenario_name, DATE_TRUNC('day', submitted_at)
ORDER BY feedback_date DESC, scenario_name;