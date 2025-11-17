
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, CreditCard, User, LogIn, LogOut, Lock, HelpCircle, PlayCircle, Info, Shield, HandIcon } from 'lucide-react';
import { Document } from './AsystentPrawny';
import { useUserStore } from '@/stores/userStore';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderBarProps {
  activeTab: 'chat' | 'documents' | 'lawyers';
  setActiveTab: (tab: 'chat' | 'documents' | 'lawyers') => void;
  documents: Document[];
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  isLoggedIn: boolean;
  setShowPaymentPopup: (show: boolean) => void;
  setShowLoginPopup: (show: boolean) => void;
  setShowRegisterPopup: (show: boolean) => void;
  onShowMediator: () => void;
}

const HeaderBar = ({ 
  activeTab, 
  setActiveTab, 
  documents, 
  showMenu, 
  setShowMenu, 
  isLoggedIn,
  setShowPaymentPopup,
  setShowLoginPopup,
  setShowRegisterPopup,
  onShowMediator
}: HeaderBarProps) => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();
  const { tokenBalance, fetchTokenBalance } = useUserStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchTokenBalance();
    }
  }, [isLoggedIn, fetchTokenBalance]);

  const handleVideoPlay = () => {
    setShowVideo(true);
  };

  const handleLogout = () => {
    setShowMenu(false);
    window.localStorage.removeItem('isLoggedIn');
    window.location.reload();
  };

  return (
    <>
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {(activeTab === 'chat' || activeTab === 'lawyers') && documents.length > 0 && isMobile && (
            <button 
              className="mr-3 p-1 hover:bg-blue-700 rounded-full md:hidden" 
              onClick={() => setActiveTab('documents')}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <a 
            href="https://info.lexai.tools/lexai-dla-kazdego/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img 
              src="/lovable-uploads/69479e8d-34fb-42e4-970c-13d3bb375736.png" 
              alt="LexAi Logo" 
              className="h-8 mr-3"
            />
          </a>
        </div>
        <div className="flex items-center">
          <button 
            className="bg-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
            onClick={() => setShowPaymentPopup(true)}
          >
            <span>Tokeny: {tokenBalance}</span>
            <CreditCard size={14} className="ml-1" />
          </button>
          <button 
            className="ml-2 p-1 hover:bg-blue-700 rounded-full"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute top-14 right-4 bg-white rounded-lg shadow-xl p-2 w-48 text-gray-800 z-50">
              {isLoggedIn ? (
                <>
                  <button className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm">
                    <User size={16} className="mr-2 text-blue-600" />
                    <span>Moje konto</span>
                  </button>
                  <button 
                    className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2 text-blue-600" />
                    <span>Wyloguj się</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm"
                    onClick={() => {
                      setShowMenu(false);
                      setShowLoginPopup(true);
                    }}
                  >
                    <LogIn size={16} className="mr-2 text-blue-600" />
                    <span>Zaloguj się</span>
                  </button>
                  <button 
                    className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm"
                    onClick={() => {
                      setShowMenu(false);
                      setShowRegisterPopup(true);
                    }}
                  >
                    <User size={16} className="mr-2 text-blue-600" />
                    <span>Utwórz konto</span>
                  </button>
                </>
              )}
              
              <hr className="my-2" />
              <button 
                className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm"
                onClick={() => {
                  setShowMenu(false);
                  setShowHelpDialog(true);
                }}
              >
                <HelpCircle size={16} className="mr-2 text-blue-600" />
                <span>Pomoc</span>
              </button>
              <button 
                className="w-full flex items-center p-2 hover:bg-gray-100 rounded text-left text-sm"
                onClick={() => {
                  setShowMenu(false);
                  onShowMediator();
                }}
              >
                <HandIcon size={16} className="mr-2 text-blue-600" />
                <span>Mediator</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <Dialog open={showHelpDialog} onOpenChange={(open) => {
        setShowHelpDialog(open);
        if (!open) {
          setShowVideo(false);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-4">Pomoc</DialogTitle>
          </DialogHeader>
          
          {showVideo ? (
            <div className="w-full aspect-video">
              <iframe 
                ref={videoRef}
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/3r1heg79hTM?autoplay=1" 
                title="LexAI - jak to działa" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <ScrollArea className={`${isMobile ? 'h-[60vh]' : 'max-h-[70vh]'}`}>
              <div className="space-y-4 text-gray-700 px-1">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Jak działa LexAi?</h3>
                  <p className="text-sm">
                    LexAi to asystent prawny oparty na sztucznej inteligencji, który pomaga zrozumieć i uporządkować sprawy prawne. 
                    Wystarczy przesłać dokument, zadać pytanie lub opisać swoją sytuację, a system przeanalizuje treść, 
                    wskaże kluczowe informacje, wyjaśni przepisy prostym językiem i pomoże znaleźć możliwe rozwiązania 
                    – zgodnie z aktualnym prawem w Polsce.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Czym są tokeny?</h3>
                  <p className="text-sm">
                    Tokeny umożliwiają zadawanie pytań Agentowi LexAi. Nigdy się nie przedawniają – możesz wykorzystać je w dowolnym momencie. 
                    Zakup tokenów jest szybki i wygodny: zapłać kartą, BLIKIEM lub tradycyjnym przelewem bankowym.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Jak chronione są moje dokumenty?
                  </h3>
                  <p className="text-sm">
                    Twoje dokumenty są anonimizowane jeszcze na Twoim urządzeniu, zanim zostaną wgrane na serwer. 
                    Dzięki temu możemy tylko przypisać je do Twojego profilu, ale nie znamy danych osoby, która jest ich właścicielem.
                  </p>
                  <p className="text-sm mt-2">
                    Dodatkowo dokumenty są przechowywane na zaszyfrowanym kontenerze i nie mamy dostępu do jego zawartości 
                    - to podwójne zabezpieczenie chroni Ciebie w pełni. Nawet jeśli służby będą chciały od nas treść zawartości 
                    przesłanych dokumentów, nie mamy jak im tego dać, ponieważ kontenery są zaszyfrowane.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-2">
                  <Button 
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleVideoPlay}
                  >
                    <PlayCircle size={20} />
                    Zobacz jak to działa
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => window.open("https://info.lexai.tools/lexai-dla-kazdego/", "_blank")}
                  >
                    <Info size={20} />
                    Więcej informacji
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeaderBar;
