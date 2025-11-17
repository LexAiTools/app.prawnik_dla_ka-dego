import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export const ConversationHistory = () => {
  const { data: conversations, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      const conversationsWithCount = await Promise.all(
        (convData || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return {
            ...conv,
            message_count: count || 0
          };
        })
      );

      return conversationsWithCount as Conversation[];
    }
  });

  const handleDelete = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      toast.success('Rozmowa została usunięta');
      refetch();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Błąd podczas usuwania rozmowy');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Historia rozmów</h2>
      
      {!conversations || conversations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Brak zapisanych rozmów
          </CardContent>
        </Card>
      ) : (
        conversations.map((conv) => (
          <Card key={conv.id} className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {conv.title || 'Nowa rozmowa'}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {conv.message_count} wiadomości
                    </span>
                    <span>
                      {format(new Date(conv.updated_at), 'PPp', { locale: pl })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(conv.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
}
