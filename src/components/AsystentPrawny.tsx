// @ts-nocheck - types will be regenerated after migration
import React, { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import HeaderBar from './HeaderBar';
import DocumentsList from './DocumentsList';
import LawyersList from './LawyersList';
import Chat from './Chat';
import NavigationBar from './NavigationBar';
import PaymentPopup from './PaymentPopup';
import MediatorDialog from './MediatorDialog';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, saveQuestion } from '@/lib/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface Document {
  id: number | string;
  name: string;
  type: string;
  date: string;
  content?: string; // Dodane pole zawartości dokumentu
}

export interface Lawyer {
  id: number;
  name: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  photoUrl?: string;
  experience: number;
  bio: string;
  expertiseAreas: string[];
}

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
}

export interface TokenPackage {
  id: number;
  tokens: number;
  price: number;
  discount: string | null;
}

const AsystentPrawny = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'lawyers'>('chat');
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  
  const [lawyers, setLawyers] = useState<Lawyer[]>([
    { 
      id: 1, 
      name: "mec. Anna Kowalska", 
      specialization: "Prawo cywilne", 
      rating: 4.8, 
      reviewsCount: 124, 
      photoUrl: "/lovable-uploads/32ed84e4-6ef3-4da5-9058-6e6abf95068c.png", 
      experience: 12,
      bio: "Specjalizuję się w prawie cywilnym, ze szczególnym uwzględnieniem spraw spadkowych i rodzinnych. Posiadam wieloletnie doświadczenie w reprezentowaniu klientów przed sądami wszystkich instancji.",
      expertiseAreas: ["Prawo spadkowe", "Prawo rodzinne", "Sprawy rozwodowe", "Podział majątku"] 
    },
    { 
      id: 2, 
      name: "mec. Jan Nowak", 
      specialization: "Prawo gospodarcze", 
      rating: 4.6, 
      reviewsCount: 87, 
      photoUrl: "/lovable-uploads/092e3c42-7aae-4801-9bdb-46bcfe6fc0dd.png", 
      experience: 15,
      bio: "Zajmuję się obsługą prawną przedsiębiorców, ze szczególnym naciskiem na prawo handlowe, umowy i spory gospodarcze. Wspieram firmy w bezpiecznym prowadzeniu działalności i zabezpieczaniu ich interesów.",
      expertiseAreas: ["Umowy handlowe", "Prawo spółek", "Windykacja należności", "Ochrona konkurencji"] 
    },
    { 
      id: 3, 
      name: "mec. Maria Wiśniewska", 
      specialization: "Prawo pracy", 
      rating: 4.9, 
      reviewsCount: 156, 
      photoUrl: "/lovable-uploads/59530f0f-1326-4057-9490-5518265f0322.png", 
      experience: 10,
      bio: "Specjalizuję się w sprawach z zakresu prawa pracy - od sporządzania i analizy umów, przez reprezentację w sporach pracowniczych, po doradztwo w zakresie zbiorowego prawa pracy.",
      expertiseAreas: ["Umowy o pracę", "Mobbing", "Wypadki przy pracy", "Zwolnienia grupowe"] 
    },
  ]);
  const [activeLawyer, setActiveLawyer] = useState<Lawyer | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', content: 'Witam! Jestem Twoim asystentem do dokumentów prawnych. W czym mogę pomóc?' }
  ]);
  const [input, setInput] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [showMediatorDialog, setShowMediatorDialog] = useState(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  
  // Check authentication and redirect to /auth if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);
  
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        const docs = await getDocuments();
        return docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.file_path.includes('PDF') || doc.file_path.includes('pdf') ? 'pdf' : 'image',
          date: new Date(doc.created_at || Date.now()).toLocaleDateString('pl-PL'),
          content: doc.file_path
        }));
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    }
  });
  
  useEffect(() => {
    if (documents.length > 0 && !activeDocument) {
      setActiveDocument(documents[0]);
      if (messages.length === 1) {
        setMessages(prev => [
          ...prev, 
          { 
            id: 2, 
            sender: 'ai', 
            content: `Dodałeś dokument "${documents[0].name}". Czy chcesz, abym wyjaśnił/a Ci jego treść?` 
          }
        ]);
      }
    }
  }, [documents, activeDocument, messages]);
  
  
  const addDocumentMutation = useMutation({
    mutationFn: async ({ name, type, content }: { name: string, type: string, content: string }) => {
      return await uploadDocument(name, type, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
  
  const saveQuestionMutation = useMutation({
    mutationFn: async ({ question, answer, documentId }: { question: string, answer: string, documentId: string | null }) => {
      return await saveQuestion(question, answer, documentId);
    }
  });
  
  const tokenPackages: TokenPackage[] = [
    { id: 1, tokens: 100, price: 47, discount: null },
    { id: 2, tokens: 470, price: 123, discount: '35%' },
    { id: 4, tokens: 7900, price: 480, discount: '65%' }
  ];

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          const fileName = file.name;
          if (file.type === 'application/pdf') {
            resolve(`Zawartość dokumentu PDF "${fileName}" została wczytana pomyślnie.\n\nWezwanie do zapłaty WDZ/01/12/2024
            
Wobec bezskutecznego upływu terminu do uregulowania należności wynikającej z poniższego zestawienia, wzywam do zapłaty kwoty 1 235,05 PLN. Do kwoty tej należy doliczyć odsetki ustawowe za opóźnienie liczone za okres od dnia następnego po terminie płatności do dnia rzeczywistej wpłaty. W przypadku nieuregulowania należności we wskazanym terminie, prosimy traktować niniejsze pismo jako przedprocesowe, ostateczne wezwanie do zapłaty.

Faktura F/01/12/2024 z dnia: 11-12-2024
Termin płatności: 01-01-2025
Data zapłaty: 16-12-2024
Wartość: 1.230,00
Odsetki %: 10.00
Kwota odsetek: 5,05

Do zapłaty: 1 235,05 PLN

Usługi Informatyczne Jan Nowak
NIP: 1234438678
Kowalska 22 / 6B
00-001 Warszawa

ABC INFO Andrzej Kowalski
NIP: 2345683788
Nowakowska 12 / 5
22-102 Góra Kalwaria`);
          } else if (file.type.startsWith('image/')) {
            resolve(`[Obraz] Zawartość dokumentu "${fileName}" wymaga przetwarzania OCR. W rzeczywistej implementacji użylibyśmy technologii OCR do ekstrakcji tekstu z obrazu.`);
          } else {
            resolve(`Zawartość dokumentu "${fileName}" została wczytana, ale obecnie nie obsługujemy pełnego podglądu dla tego typu pliku.`);
          }
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Błąd podczas odczytywania pliku.'));
      };
      
      if (file.type === 'text/plain' || file.type === 'text/html' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleAddDocument = async (file: File | { name: string }, type = 'file') => {
    let content = '';
    
    if ('name' in file && file instanceof File) {
      try {
        content = await readFileContent(file);
        console.log("Odczytana zawartość pliku:", content.substring(0, 100) + "...");
      } catch (error) {
        console.error('Błąd odczytu pliku:', error);
        content = 'Nie udało się odczytać zawartości pliku.';
      }
    } else if (type === 'camera') {
      content = '[Obraz z kamery] Ten dokument wymaga przetwarzania OCR. Tutaj wyświetlony jest przykładowy tekst dla demonstracji.';
    }
    
    const filename = 'name' in file ? file.name : `Dokument-${documents.length + 1}.${type === 'camera' ? 'jpg' : 'pdf'}`;
    const fileType = type === 'camera' ? 'image' : (file as File).type?.split('/')[1] || 'pdf';
    
    try {
      await addDocumentMutation.mutateAsync({
        name: filename,
        type: fileType,
        content: content
      });
      
      toast.success(`Dokument "${filename}" został dodany.`);
      setShowUploadOptions(false);
      setActiveTab('chat');
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Nie udało się dodać dokumentu. Spróbuj ponownie.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAddDocument(e.target.files[0]);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const newUserMessage: Message = { id: messages.length + 1, sender: 'user', content: input };
    setMessages([...messages, newUserMessage]);
    setInput('');
    
    const userInput = input.toLowerCase();
    const isLookingForLawyer = 
      userInput.includes('prawnik') || 
      userInput.includes('prawnika') ||
      userInput.includes('adwokat') || 
      userInput.includes('pomoc prawna');
      
    if (isLookingForLawyer) {
      handleNeedLawyer();
    } else {
      setTimeout(() => {
        const responsePrefix = activeDocument 
          ? `Analizuję Twoje pytanie dotyczące dokumentu "${activeDocument.name}". Na podstawie jego treści mogę powiedzieć, że...`
          : 'Nie masz obecnie wybranego dokumentu. Proszę dodaj dokument, abym mógł Ci pomóc bardziej konkretnie.';
        
        const newAiMessage: Message = { 
          id: messages.length + 2, 
          sender: 'ai', 
          content: responsePrefix
        };
        
        setMessages(prevMessages => [...prevMessages, newAiMessage]);
        
        if (activeDocument) {
          saveQuestionMutation.mutate({
            question: input,
            answer: responsePrefix,
            documentId: activeDocument.id.toString()
          });
        }
      }, 1000);
    }
  };

  const handleAnalyzeDocument = () => {
    if (!activeDocument) {
      toast.error('Nie wybrano dokumentu do analizy.');
      return;
    }
    
    const analysisMessage: Message = { 
      id: messages.length + 1, 
      sender: 'ai', 
      content: `Rozpoczynam analizę dokumentu "${activeDocument.name}"...` 
    };
    
    setMessages([...messages, analysisMessage]);
    
    setTimeout(() => {
      const resultMessage: Message = { 
        id: messages.length + 2, 
        sender: 'ai', 
        content: `Zakończyłem analizę dokumentu "${activeDocument.name}". 
        
Jest to ${activeDocument.type === 'pdf' ? 'dokument PDF' : 'obraz'} z następującymi kluczowymi informacjami:

Kluczowe informacje:
- Typ dokumentu: ${activeDocument.type === 'pdf' ? 'PDF' : 'Obraz'}
- Data dodania: ${activeDocument.date}
- Zawiera ${activeDocument.content?.length || 0} znaków tekstu` 
      };
      
      const suggestLawyerMessage: Message = {
        id: messages.length + 3,
        sender: 'ai',
        content: `Czy potrzebujesz pomocy prawnika w tej sprawie?`
      };
      
      setMessages(prevMessages => [...prevMessages, resultMessage, suggestLawyerMessage]);
      
      saveQuestionMutation.mutate({
        question: `Analiza dokumentu: ${activeDocument.name}`,
        answer: resultMessage.content,
        documentId: activeDocument.id.toString()
      });
    }, 2000);
  };

  const handleNeedLawyer = () => {
    const documentContent = activeDocument?.content?.toLowerCase() || '';
    let suggestedLawyers: Lawyer[] = [];
    
    if (documentContent.includes('umowa') || documentContent.includes('najm')) {
      suggestedLawyers = lawyers.filter(lawyer => 
        lawyer.specialization === 'Prawo cywilne' || 
        lawyer.expertiseAreas.some(area => area.toLowerCase().includes('umow'))
      );
    } else if (documentContent.includes('firma') || documentContent.includes('spółk')) {
      suggestedLawyers = lawyers.filter(lawyer => 
        lawyer.specialization === 'Prawo gospodarcze'
      );
    } else if (documentContent.includes('prac') || documentContent.includes('zatrudni')) {
      suggestedLawyers = lawyers.filter(lawyer => 
        lawyer.specialization === 'Prawo pracy'
      );
    } else {
      suggestedLawyers = lawyers;
    }
    
    if (suggestedLawyers.length > 0) {
      const suggestedLawyersMessage: Message = {
        id: messages.length + 1,
        sender: 'ai',
        content: `Na podstawie analizy Twojej sprawy, mogę zaproponować pomoc następujących prawników:`
      };
      
      const lawyersList = suggestedLawyers
        .map(lawyer => `- ${lawyer.name} (${lawyer.specialization}, ${lawyer.experience} lat doświadczenia)`)
        .join('\n');
        
      const lawyersListMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        content: lawyersList
      };
      
      const actionMessage: Message = {
        id: messages.length + 3,
        sender: 'ai',
        content: `Możesz przejść do sekcji "Prawnicy", aby wybrać jednego z nich i wysłać zapytanie.`
      };
      
      setMessages(prevMessages => [...prevMessages, suggestedLawyersMessage, lawyersListMessage, actionMessage]);
      
      if (isMobile) {
        setActiveTab('lawyers');
      } else {
        if (tabsRef.current) {
          const tabElement = tabsRef.current.querySelector('[value="lawyers"]') as HTMLButtonElement;
          if (tabElement) {
            tabElement.click();
          }
        }
      }
    } else {
      const noLawyersMessage: Message = {
        id: messages.length + 1,
        sender: 'ai',
        content: `W tej chwili nie mamy prawników wyspecjalizowanych dokładnie w Twojej sprawie. Możesz jednak przejrzeć listę wszystkich dostępnych prawników w zakładce "Prawnicy".`
      };
      
      setMessages(prevMessages => [...prevMessages, noLawyersMessage]);
    }
  };

  const handleDeleteDocument = async (documentId: number | string) => {
    const documentToDelete = documents.find(doc => doc.id === documentId);
    if (!documentToDelete) return;
    
    try {
      // @ts-ignore - types will be regenerated after migration
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId.toString());
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      if (activeDocument?.id === documentId && documents.length > 1) {
        const newActiveDoc = documents.find(doc => doc.id !== documentId);
        if (newActiveDoc) {
          setActiveDocument(newActiveDoc);
        }
      } else if (documents.length <= 1) {
        setActiveDocument(null);
      }
      
      toast.success(`Dokument "${documentToDelete.name}" został usunięty.`);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Nie udało się usunąć dokumentu. Spróbuj ponownie.');
    }
  };

  const handleSendInquiry = (lawyerId: number, message: string, attachConversation: boolean, attachedDocumentIds: (string | number)[]) => {
    const lawyer = lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return;
    
    const attachedDocs = documents.filter(doc => attachedDocumentIds.includes(doc.id));
    const attachmentsList = attachedDocs.map(doc => doc.name).join(", ");
    
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: `Wysłałem zapytanie do ${lawyer.name}`
    };
    
    const aiResponseMessage: Message = {
      id: messages.length + 2,
      sender: 'ai',
      content: `Twoje zapytanie zostało wysłane do ${lawyer.name}.\n\n${
        attachedDocs.length > 0 ? `Załączone dokumenty: ${attachmentsList}\n\n` : ''
      }${attachConversation ? 'Dołączono również transkrypcję naszej rozmowy.\n\n' : ''}Prawnik odpowie najszybciej jak to możliwe.`
    };
    
    setMessages(prev => [...prev, userMessage, aiResponseMessage]);
    setActiveTab('chat');
    
    toast.success(`Zapytanie zostało wysłane do ${lawyer.name}`);
  };

  const handleShowMediator = () => {
    setShowMediatorDialog(true);
  };

  const isMobileView = isMobile;
  
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Always logged in since we redirect unauthenticated users

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 text-white">
      <HeaderBar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        isLoggedIn={isLoggedIn}
        setShowPaymentPopup={setShowPaymentPopup}
        setShowLoginPopup={() => navigate('/auth')}
        setShowRegisterPopup={() => navigate('/auth')}
        onShowMediator={handleShowMediator}
      />

      {isLoadingDocuments ? (
        <div className="flex-1 flex items-center justify-center bg-white text-gray-800 rounded-t-3xl">
          <p>Ładowanie dokumentów...</p>
        </div>
      ) : (
        <main className={`flex-1 flex ${!isMobileView && activeTab === 'chat' ? 'flex-row' : 'flex-col'} overflow-hidden`}>
          {(activeTab === 'documents' || activeTab === 'lawyers' || !isMobileView) && (
            <div className={`${!isMobileView && activeTab === 'chat' ? 'w-1/3 min-w-[300px] border-r border-gray-200' : 'flex-1'} bg-white ${isMobileView ? 'rounded-t-3xl' : ''} text-gray-800 overflow-y-auto`}>
              {!isMobileView ? (
                <Tabs 
                  defaultValue="documents" 
                  className="w-full"
                  ref={tabsRef}
                  value={activeTab === 'chat' ? undefined : activeTab}
                  onValueChange={(value) => {
                    if (value === 'documents' || value === 'lawyers') {
                      if (isMobileView) {
                        setActiveTab(value as 'documents' | 'lawyers');
                      }
                    }
                  }}
                >
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="documents">Dokumenty</TabsTrigger>
                    <TabsTrigger value="lawyers">Prawnicy</TabsTrigger>
                  </TabsList>
                  <TabsContent value="documents">
                    <DocumentsList 
                      documents={documents}
                      activeDocument={activeDocument || documents[0]}
                      setActiveDocument={setActiveDocument}
                      setActiveTab={setActiveTab}
                      fileInputRef={fileInputRef}
                      onDeleteDocument={handleDeleteDocument}
                      setShowUploadOptions={setShowUploadOptions}
                    />
                  </TabsContent>
                  <TabsContent value="lawyers">
                    <LawyersList 
                      lawyers={lawyers}
                      documents={documents}
                      activeLawyer={activeLawyer}
                      setActiveLawyer={setActiveLawyer}
                      setActiveTab={setActiveTab}
                      onSendInquiry={handleSendInquiry}
                    />
                  </TabsContent>
                </Tabs>
              ) : activeTab === 'documents' ? (
                <DocumentsList 
                  documents={documents}
                  activeDocument={activeDocument || (documents.length > 0 ? documents[0] : {} as Document)}
                  setActiveDocument={setActiveDocument}
                  setActiveTab={setActiveTab}
                  fileInputRef={fileInputRef}
                  onDeleteDocument={handleDeleteDocument}
                  setShowUploadOptions={setShowUploadOptions}
                />
              ) : (
                <LawyersList 
                  lawyers={lawyers}
                  documents={documents}
                  activeLawyer={activeLawyer}
                  setActiveLawyer={setActiveLawyer}
                  setActiveTab={setActiveTab}
                  onSendInquiry={handleSendInquiry}
                />
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className={`flex-1 flex flex-col bg-white ${isMobileView ? 'rounded-t-3xl' : ''} text-gray-800`}>
              <Chat 
                activeDocument={activeDocument}
                messages={messages}
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                handleAnalyzeDocument={handleAnalyzeDocument}
                fileInputRef={fileInputRef}
                cameraInputRef={cameraInputRef}
                lawyers={lawyers}
                setActiveTab={setActiveTab}
                setActiveLawyer={setActiveLawyer}
                onNeedLawyer={handleNeedLawyer}
              />
            </div>
          )}
        </main>
      )}

      {isMobileView && (
        <NavigationBar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowUploadOptions={setShowUploadOptions}
          showUploadOptions={showUploadOptions}
          fileInputRef={fileInputRef}
          cameraInputRef={cameraInputRef}
          handleCameraCapture={handleCameraCapture}
          handleFileUpload={handleFileUpload}
          onShowMediator={handleShowMediator}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        onChange={handleFileUpload}
      />

      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
      />

      {showPaymentPopup && (
        <PaymentPopup 
          tokenPackages={tokenPackages}
          setShowPaymentPopup={setShowPaymentPopup}
        />
      )}
      
      <MediatorDialog 
        open={showMediatorDialog}
        onOpenChange={setShowMediatorDialog}
      />
    </div>
  );
};

export default AsystentPrawny;
