-- AI Tutor v2 Schema

-- 1. Chat Sessions Table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    image_url TEXT, -- URL to Cloudinary image
    audio_url TEXT, -- URL to Cloudinary audio (future proofing)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Sessions Policies
CREATE POLICY "Users can view own sessions" 
ON ai_chat_sessions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
ON ai_chat_sessions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON ai_chat_sessions FOR UPDATE
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
ON ai_chat_sessions FOR DELETE
TO authenticated 
USING (auth.uid() = user_id);

-- Messages Policies (Linked via Session)
CREATE POLICY "Users can view messages of own sessions" 
ON ai_chat_messages FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM ai_chat_sessions 
        WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
        AND ai_chat_sessions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages to own sessions" 
ON ai_chat_messages FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM ai_chat_sessions 
        WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
        AND ai_chat_sessions.user_id = auth.uid()
    )
);
