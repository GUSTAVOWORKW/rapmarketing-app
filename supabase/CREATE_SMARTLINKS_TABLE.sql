CREATE TABLE public.smart_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Artist Info
  artist_name TEXT NOT NULL,
  artist_title TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Release Info
  release_title TEXT NOT NULL,
  feat TEXT,
  cover_image_url TEXT,
  player_url TEXT,
  
  -- Links
  platforms JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  
  -- Contact Button
  contact_button_text TEXT,
  contact_button_url TEXT,
  
  -- Template
  template TEXT DEFAULT 'inspiration',
  
  -- Analytics
  view_count INT DEFAULT 0
);

-- RLS Policies
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own smart_links" 
ON public.smart_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own smart_links" 
ON public.smart_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own smart_links" 
ON public.smart_links 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own smart_links" 
ON public.smart_links 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION handle_smart_link_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER on_smart_link_update
BEFORE UPDATE ON public.smart_links
FOR EACH ROW
EXECUTE PROCEDURE handle_smart_link_update();
