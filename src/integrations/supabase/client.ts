
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = "https://gykzyomeufgchaxuxazz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5a3p5b21ldWZnY2hheHV4YXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MjI5OTQsImV4cCI6MjA1ODk5ODk5NH0.KR8BfVNj1k4nRPfkUO9hDKb1TrkEKlMmmFPo1sNyxZY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper to get or create anonymous session
export async function getOrCreateAnonymousSession() {
  // Check local storage for existing session
  let sessionId = localStorage.getItem('anonymous_session_id');
  let sessionDbId: string | null = null;
  
  if (!sessionId) {
    // Create new session ID
    sessionId = uuidv4();
    localStorage.setItem('anonymous_session_id', sessionId);
    
    // Create session in database
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .insert({ session_id: sessionId })
      .select();
      
    if (error) {
      console.error('Error creating anonymous session:', error);
      throw error;
    }
    
    sessionDbId = data[0]?.id || null;
  } else {
    // Pobierz ID sesji z bazy danych na podstawie session_id
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Jeśli sesja nie istnieje w bazie danych, utwórz ją
        const { data: newSessionData, error: insertError } = await supabase
          .from('anonymous_sessions')
          .insert({ session_id: sessionId })
          .select();
          
        if (insertError) {
          console.error('Error creating anonymous session:', insertError);
          throw insertError;
        }
        
        sessionDbId = newSessionData[0]?.id || null;
      } else {
        console.error('Error fetching anonymous session:', error);
        throw error;
      }
    } else {
      sessionDbId = data?.id || null;
    }
  }
  
  // Ustaw kontekst sesji dla polityk RLS
  try {
    if (sessionId) {
      await supabase.rpc('set_session_context', {
        session_id: sessionId
      } satisfies Record<string, unknown>);
    }
  } catch (error) {
    console.error('Error setting session context:', error);
  }
  
  return { sessionId, sessionDbId };
}

// Upload document content to database
export async function uploadDocument(name: string, type: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { sessionId, sessionDbId } = await getOrCreateAnonymousSession();
  
  // Create document entry with proper handling of anonymous_session_id vs user_id
  const insertData = {
    name,
    file_path: content, // Store content directly in file_path for simplicity
    user_id: user?.id || null,
    anonymous_session_id: user?.id ? null : sessionDbId
  };
  
  const { data, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single();
    
  if (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
  
  // Update anonymous session document count if not logged in
  if (!user?.id && sessionDbId) {
    const { data: sessionData, error: sessionError } = await supabase
      .from('anonymous_sessions')
      .select('documents_uploaded')
      .eq('id', sessionDbId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
    } else {
      const currentCount = sessionData?.documents_uploaded || 0;
      
      await supabase
        .from('anonymous_sessions')
        .update({ documents_uploaded: currentCount + 1 })
        .eq('id', sessionDbId);
    }
  }
  
  return data;
}

// Save question to database
export async function saveQuestion(question: string, answer: string, documentId: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  const { sessionId, sessionDbId } = await getOrCreateAnonymousSession();
  
  // Zapisz pytanie with proper handling of anonymous_session_id vs user_id
  const insertData = {
    question,
    answer,
    document_id: documentId,
    user_id: user?.id || null,
    anonymous_session_id: user?.id ? null : sessionDbId
  };
  
  const { data, error } = await supabase
    .from('questions')
    .insert(insertData)
    .select();
    
  if (error) {
    console.error('Error saving question:', error);
    throw error;
  }
  
  // Update anonymous session question count if not logged in
  if (!user?.id && sessionDbId) {
    const { data: sessionData, error: sessionError } = await supabase
      .from('anonymous_sessions')
      .select('questions_asked')
      .eq('id', sessionDbId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
    } else {
      const currentCount = sessionData?.questions_asked || 0;
      
      await supabase
        .from('anonymous_sessions')
        .update({ questions_asked: currentCount + 1 })
        .eq('id', sessionDbId);
    }
  }
  
  return data;
}

// Get documents for current user or session
export async function getDocuments() {
  const { data: { user } } = await supabase.auth.getUser();
  const { sessionId, sessionDbId } = await getOrCreateAnonymousSession();
  
  // Simplified queries to prevent infinite type recursion
  if (user?.id) {
    // Get documents for logged in user
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, created_at, file_path, analyzed')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
    
    return data;
  } else if (sessionDbId) {
    // Get documents for anonymous session
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, created_at, file_path, analyzed')
        .eq('anonymous_session_id', sessionDbId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getDocuments for anonymous session:', error);
      return [];
    }
  }
  
  return [];
}
