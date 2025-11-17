-- Create anonymous_sessions table
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  questions_asked integer DEFAULT 0,
  documents_uploaded integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for anonymous sessions (anyone can CRUD their own session)
CREATE POLICY "Anyone can insert anonymous sessions"
ON public.anonymous_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view anonymous sessions"
ON public.anonymous_sessions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update anonymous sessions"
ON public.anonymous_sessions
FOR UPDATE
TO anon, authenticated
USING (true);

-- Add anonymous_session_id columns to existing tables
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS anonymous_session_id uuid 
REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS anonymous_session_id uuid 
REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS anonymous_session_id uuid 
REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE;

-- Make user_id nullable to allow anonymous sessions
ALTER TABLE public.documents ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.messages ALTER COLUMN user_id DROP NOT NULL;

-- Add check constraint to ensure either user_id or anonymous_session_id is set
ALTER TABLE public.documents 
ADD CONSTRAINT documents_user_or_session_check 
CHECK (
  (user_id IS NOT NULL AND anonymous_session_id IS NULL) OR 
  (user_id IS NULL AND anonymous_session_id IS NOT NULL)
);

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_user_or_session_check 
CHECK (
  (user_id IS NOT NULL AND anonymous_session_id IS NULL) OR 
  (user_id IS NULL AND anonymous_session_id IS NOT NULL)
);

ALTER TABLE public.messages 
ADD CONSTRAINT messages_user_or_session_check 
CHECK (
  (user_id IS NOT NULL AND anonymous_session_id IS NULL) OR 
  (user_id IS NULL AND anonymous_session_id IS NOT NULL)
);

-- RLS policies for anonymous users on documents
CREATE POLICY "Anonymous users can insert documents"
ON public.documents
FOR INSERT
TO anon
WITH CHECK (anonymous_session_id IS NOT NULL);

CREATE POLICY "Anonymous users can view their documents"
ON public.documents
FOR SELECT
TO anon
USING (anonymous_session_id IS NOT NULL);

-- RLS policies for anonymous users on conversations
CREATE POLICY "Anonymous users can insert conversations"
ON public.conversations
FOR INSERT
TO anon
WITH CHECK (anonymous_session_id IS NOT NULL);

CREATE POLICY "Anonymous users can view their conversations"
ON public.conversations
FOR SELECT
TO anon
USING (anonymous_session_id IS NOT NULL);

-- RLS policies for anonymous users on messages
CREATE POLICY "Anonymous users can insert messages"
ON public.messages
FOR INSERT
TO anon
WITH CHECK (anonymous_session_id IS NOT NULL);

CREATE POLICY "Anonymous users can view their messages"
ON public.messages
FOR SELECT
TO anon
USING (anonymous_session_id IS NOT NULL);

-- Function to transfer anonymous data to user account
CREATE OR REPLACE FUNCTION public.transfer_anonymous_data_to_user(
  p_session_id text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_db_id uuid;
BEGIN
  -- Find session ID in database
  SELECT id INTO v_session_db_id
  FROM public.anonymous_sessions
  WHERE session_id = p_session_id;
  
  IF v_session_db_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Transfer documents
  UPDATE public.documents
  SET user_id = p_user_id,
      anonymous_session_id = NULL
  WHERE anonymous_session_id = v_session_db_id;
  
  -- Transfer conversations
  UPDATE public.conversations
  SET user_id = p_user_id,
      anonymous_session_id = NULL
  WHERE anonymous_session_id = v_session_db_id;
  
  -- Transfer messages
  UPDATE public.messages
  SET user_id = p_user_id,
      anonymous_session_id = NULL
  WHERE anonymous_session_id = v_session_db_id;
  
  -- Delete anonymous session
  DELETE FROM public.anonymous_sessions
  WHERE id = v_session_db_id;
END;
$$;