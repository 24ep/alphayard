-- Create emotion_records table
CREATE TABLE IF NOT EXISTS emotion_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion_type VARCHAR(50) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id and recorded_at for faster queries
CREATE INDEX IF NOT EXISTS idx_emotion_records_user_date ON emotion_records(user_id, recorded_at);
