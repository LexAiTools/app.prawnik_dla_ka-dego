import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Coins } from 'lucide-react';
import { toast } from 'sonner';
import ChatInterface from '@/components/ChatInterface';
import DocumentsList from '@/components/DocumentsList';
import { ConversationHistory } from '@/components/ConversationHistory';
import PaymentPopup from '@/components/PaymentPopup';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tokenBalance, fetchTokenBalance } = useUserStore();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      fetchTokenBalance();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchTokenBalance]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Wylogowano pomyślnie');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Panel Użytkownika</h1>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPaymentPopup(true)}
              className="gap-2"
            >
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{tokenBalance ?? 0} tokenów</span>
            </Button>
            
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="documents">Dokumenty</TabsTrigger>
            <TabsTrigger value="history">Historia</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsList />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ConversationHistory />
          </TabsContent>
        </Tabs>
      </main>

      {showPaymentPopup && (
        <PaymentPopup
          tokenPackages={[]}
          setShowPaymentPopup={setShowPaymentPopup}
        />
      )}
    </div>
  );
}
