import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthDialog } from '@/components/auth/AuthDialog';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleStartApp = () => {
    navigate('/dashboard');
  };

  const toggleMicrophone = async () => {
    if (!isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setIsListening(true);
        toast({
          title: "Mikrofon aktywny",
          description: "Możesz teraz mówić.",
        });
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
          variant: "destructive",
          title: "Błąd dostępu do mikrofonu",
          description: "Nie udało się uzyskać dostępu do mikrofonu. Sprawdź ustawienia przeglądarki.",
        });
      }
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach(track => {
          track.stop();
        });
        setAudioStream(null);
      }
      setIsListening(false);
      toast({
        title: "Mikrofon wyłączony",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background image section */}
      <div 
        className="flex-1 flex flex-col relative"
        style={{
          backgroundImage: 'url("/lovable-uploads/092e3c42-7aae-4801-9bdb-46bcfe6fc0dd.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Auth buttons in top-right corner */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => {
              setDefaultTab('signup');
              setShowAuthDialog(true);
            }}
          >
            Zarejestruj się
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => {
              setDefaultTab('signin');
              setShowAuthDialog(true);
            }}
          >
            Zaloguj się
          </Button>
        </div>
        
        {/* Top section with title and subtitle */}
        <div className="flex flex-col items-center text-center px-6 pt-16 pb-12 text-white relative z-10">
          <h1 className="text-5xl font-light mb-8" style={{ fontFamily: "'Manjari', sans-serif" }}>
            Prawnik<br />w telefonie
          </h1>
          <p className="text-center text-lg leading-relaxed max-w-md" style={{ color: '#a6a6a6' }}>
            Pomaga w zrozumieniu skomplikowanych dokumentów, tłumacząc trudne przepisy na jasny język, wskazując kluczowe informacje i podpowiadając najlepsze rozwiązania.
          </p>
        </div>

        {/* Microphone button */}
        <div className="flex justify-center py-8 relative z-10">
          <button 
            className={`w-24 h-24 rounded-full ${isListening ? 'bg-red-600' : 'bg-blue-600'} flex items-center justify-center transition-colors duration-300`}
            onClick={toggleMicrophone}
          >
            {isListening ? 
              <MicOff className="text-white w-12 h-12" /> : 
              <Mic className="text-white w-12 h-12" />
            }
          </button>
        </div>
      </div>

      {/* Bottom white card */}
      <div className="bg-white rounded-t-3xl -mt-5 px-6 pt-8 pb-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Wsparcie<br />w każdej sprawie
          </h2>
          
          <div className="text-center text-gray-600 mb-12 leading-relaxed">
            <p>
              Zrób zdjęcie pisma z urzędu, wezwania do sądu, umowy kredytowej lub umowy najmu przed podpisaniem. Powiem Ci co może być niekorzystne lub co zrobić.
            </p>
          </div>

          <Button 
            className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800"
            onClick={handleStartApp}
          >
            Zadaj pytanie
          </Button>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab={defaultTab}
      />
    </div>
  );
};

export default LandingPage;
