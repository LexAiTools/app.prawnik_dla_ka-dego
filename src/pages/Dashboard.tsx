import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { LogOut, Coins, User, HelpCircle, Shield, Menu } from 'lucide-react';
import { toast } from 'sonner';
import ChatInterface from '@/components/ChatInterface';
import DocumentsList from '@/components/DocumentsList';
import { DocumentUpload } from '@/components/DocumentUpload';
import { ConversationHistory } from '@/components/ConversationHistory';
import PaymentPopup from '@/components/PaymentPopup';
import UserProfile from '@/components/UserProfile';
import HelpDialog from '@/components/HelpDialog';
import MediatorDialog from '@/components/MediatorDialog';
import { Document } from '@/components/AsystentPrawny';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tokenBalance, fetchTokenBalance } = useUserStore();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showMediatorDialog, setShowMediatorDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Błąd pobierania dokumentów');
        return [];
      }

      return (data || []).map((dbDoc: any): Document => ({
        id: dbDoc.id,
        name: dbDoc.name,
        type: dbDoc.file_type.startsWith('image/') ? 'image' : 'file',
        content: '',
        date: new Date(dbDoc.updated_at).toLocaleDateString('pl-PL'),
        file_path: dbDoc.file_path
      }));
    }
  });

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

  const handleDeleteDocument = async (documentId: string | number) => {
    try {
      const docToDelete = documents.find(d => d.id === documentId);
      if (!docToDelete || !docToDelete.file_path) return;

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docToDelete.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', String(documentId));

      if (dbError) throw dbError;

      toast.success('Dokument usunięty');
      refetchDocuments();
      
      if (activeDocument?.id === documentId) {
        setActiveDocument(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Błąd usuwania dokumentu');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Wylogowywanie...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Błąd Supabase signOut:', error);
        throw error;
      }
      
      console.log('✅ Wylogowano pomyślnie');
      toast.success('Wylogowano pomyślnie');
      // Przekierowanie obsługuje listener onAuthStateChange
    } catch (error) {
      console.error('❌ Błąd wylogowania:', error);
      toast.error('Błąd wylogowania');
    }
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setShowUserProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Moje konto
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowHelpDialog(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Pomoc
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowMediatorDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Mediator
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <div className="mb-4">
              <DocumentUpload 
                onUploadComplete={() => {
                  refetchDocuments();
                  toast.success('Dokument dodany pomyślnie');
                }} 
              />
            </div>
            
            <DocumentsList 
              documents={documents}
              activeDocument={activeDocument}
              setActiveDocument={setActiveDocument}
              setActiveTab={setActiveTab}
              onDeleteDocument={handleDeleteDocument}
            />
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

      <UserProfile
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        onBuyTokens={() => {
          setShowUserProfile(false);
          setShowPaymentPopup(true);
        }}
      />

      <HelpDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />

      <MediatorDialog
        open={showMediatorDialog}
        onOpenChange={setShowMediatorDialog}
      />
    </div>
  );
}
