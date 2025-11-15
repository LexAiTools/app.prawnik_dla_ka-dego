
import { useEffect, useState } from 'react';
import { supabase, getOrCreateAnonymousSession } from '@/integrations/supabase/client';

export const useAnonymousSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDbId, setSessionDbId] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [documentsUploaded, setDocumentsUploaded] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        
        // Uzyskanie lub utworzenie sesji anonimowej
        const { sessionId, sessionDbId } = await getOrCreateAnonymousSession();
        
        // Pobranie danych sesji
        if (sessionDbId) {
          const { data } = await supabase
            .from('anonymous_sessions')
            .select('questions_asked, documents_uploaded')
            .eq('id', sessionDbId)
            .single();

          if (data) {
            setQuestionsAsked(data.questions_asked || 0);
            setDocumentsUploaded(data.documents_uploaded || 0);
          }
        }

        setSessionId(sessionId);
        setSessionDbId(sessionDbId);
      } catch (error) {
        console.error('Error initializing anonymous session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const incrementQuestions = async () => {
    if (!sessionDbId) return;
    
    const newCount = questionsAsked + 1;
    
    try {
      await supabase
        .from('anonymous_sessions')
        .update({ questions_asked: newCount })
        .eq('id', sessionDbId);
        
      setQuestionsAsked(newCount);
    } catch (error) {
      console.error('Error incrementing questions count:', error);
    }
  };

  const incrementDocuments = async () => {
    if (!sessionDbId) return;
    
    const newCount = documentsUploaded + 1;
    
    try {
      await supabase
        .from('anonymous_sessions')
        .update({ documents_uploaded: newCount })
        .eq('id', sessionDbId);
        
      setDocumentsUploaded(newCount);
    } catch (error) {
      console.error('Error incrementing documents count:', error);
    }
  };

  return {
    sessionId,
    sessionDbId,
    questionsAsked,
    documentsUploaded,
    incrementQuestions,
    incrementDocuments,
    isOverLimit: questionsAsked >= 5 || documentsUploaded >= 2,
    isLoading
  };
};
