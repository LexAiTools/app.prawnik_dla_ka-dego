// @ts-nocheck - types will be regenerated after migration
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Helper to get or create anonymous session
export async function getOrCreateAnonymousSession() {
  let sessionId = localStorage.getItem('anonymous_session_id');
  let sessionDbId: string | null = null;
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('anonymous_session_id', sessionId);
    
    // @ts-ignore - types will be regenerated after migration
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
    // @ts-ignore - types will be regenerated after migration
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // @ts-ignore - types will be regenerated after migration
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
  
  try {
    if (sessionId) {
      await supabase.rpc('set_session_context', {
        session_id: sessionId
      } as any);
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
  
  const insertData = {
    name,
    file_path: content,
    user_id: user?.id || null,
    anonymous_session_id: user?.id ? null : sessionDbId
  };
  
  // @ts-ignore - types will be regenerated after migration
  const { data, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single();
    
  if (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
  
  if (!user?.id && sessionDbId) {
    // @ts-ignore - types will be regenerated after migration
    const { data: sessionData, error: sessionError } = await supabase
      .from('anonymous_sessions')
      .select('documents_uploaded')
      .eq('id', sessionDbId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
    } else {
      const currentCount = sessionData?.documents_uploaded || 0;
      
      // @ts-ignore - types will be regenerated after migration
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
  
  const insertData = {
    question,
    answer,
    document_id: documentId,
    user_id: user?.id || null,
    anonymous_session_id: user?.id ? null : sessionDbId
  };
  
  // @ts-ignore - types will be regenerated after migration
  const { data, error } = await supabase
    .from('questions')
    .insert(insertData)
    .select();
    
  if (error) {
    console.error('Error saving question:', error);
    throw error;
  }
  
  if (!user?.id && sessionDbId) {
    // @ts-ignore - types will be regenerated after migration
    const { data: sessionData, error: sessionError } = await supabase
      .from('anonymous_sessions')
      .select('questions_asked')
      .eq('id', sessionDbId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
    } else {
      const currentCount = sessionData?.questions_asked || 0;
      
      // @ts-ignore - types will be regenerated after migration
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
  
  if (user?.id) {
    // @ts-ignore - types will be regenerated after migration
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
    try {
      // @ts-ignore - types will be regenerated after migration
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
