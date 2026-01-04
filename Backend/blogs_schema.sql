-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'General',
    image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read blogs
CREATE POLICY "Public Read Access" ON blogs
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert (create) blogs
CREATE POLICY "Authenticated Insert Access" ON blogs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authors can update their own blogs
CREATE POLICY "Authors Update Access" ON blogs
    FOR UPDATE USING (auth.uid() = author_id);
    
-- Policy: Authors can delete their own blogs
CREATE POLICY "Authors Delete Access" ON blogs
    FOR DELETE USING (auth.uid() = author_id);
