// @ts-nocheck - types will be regenerated after migration

import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import { supabase } from '../integrations/supabase/client';
import { getDocuments, getOrCreateAnonymousSession } from '../lib/supabase-helpers';
import { toast } from 'sonner';

const ChatDemo = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        
        // Inicjalizacja sesji anonimowej
        await getOrCreateAnonymousSession();
        
        // Test połączenia z Supabase
        // @ts-ignore - types will be regenerated after migration
        const { data, error } = await supabase.from('documents').select('count');
        
        if (error) {
          console.error('Supabase connection error:', error);
          toast.error('Problem z połączeniem z bazą danych');
        } else {
          console.log('Connected to Supabase successfully');
          
          // Sprawdzenie dokumentów
          const documents = await getDocuments();
          console.log('Documents available:', documents?.length || 0);
        }
      } catch (e) {
        console.error('Supabase check failed:', e);
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Chat Demo</h1>
      {loading ? (
        <div className="text-center">Łączenie z bazą danych...</div>
      ) : (
        <ChatInterface />
      )}
    </div>
  );
};

export default ChatDemo;
