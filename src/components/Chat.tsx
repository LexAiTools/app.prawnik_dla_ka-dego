import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, FileText, Send, FilePlus, Mic, MicOff } from 'lucide-react';
import { Document, Message, Lawyer } from './AsystentPrawny';
import { useIsMobile } from '@/hooks/use-mobile';
import { Image } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

interface ChatProps {
  activeDocument: Document | null;
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  handleAnalyzeDocument: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  cameraInputRef?: React.RefObject<HTMLInputElement>;
  setShowUploadOptions?: (show: boolean) => void;
  lawyers?: Lawyer[];
  setActiveTab?: (tab: 'chat' | 'documents' | 'lawyers') => void;
  setActiveLawyer?: (lawyer: Lawyer) => void;
  onNeedLawyer?: () => void;
}

const Chat = ({ 
  activeDocument, 
  messages, 
  input, 
  setInput, 
  handleSendMessage, 
  handleAnalyzeDocument,
  fileInputRef,
  cameraInputRef,
  lawyers = [],
  setActiveTab,
  setActiveLawyer,
  onNeedLawyer
}: ChatProps) => {
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [showLawyerSuggestion, setShowLawyerSuggestion] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const lastUserMessages = [...messages].reverse();
    const lastUserMessageIndex = lastUserMessages.findIndex(m => m.sender === 'user');
    
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = lastUserMessages[lastUserMessageIndex];
      const messageText = lastUserMessage.content.toLowerCase();
      
      if (
        messageText.includes('prawnik') || 
        messageText.includes('prawnika') ||
        messageText.includes('adwokat') || 
        messageText.includes('pomoc prawna') ||
        messageText.includes('potrzebuję pomocy')
      ) {
        const aiMessagesAfterUserMessage = lastUserMessages.slice(0, lastUserMessageIndex);
        const lastAiMessageIndex = aiMessagesAfterUserMessage.findIndex(m => m.sender === 'ai');
        
        if (lastAiMessageIndex !== -1) {
          const lastAiMessage = aiMessagesAfterUserMessage[lastAiMessageIndex];
          if (!lastAiMessage.content.includes('Czy potrzebujesz pomocy prawnika?')) {
            setShowLawyerSuggestion(true);
          }
        } else {
          setShowLawyerSuggestion(true);
        }
      }
    }
  }, [messages]);

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

  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectLawyer = (lawyer: Lawyer) => {
    if (setActiveLawyer && setActiveTab) {
      setActiveLawyer(lawyer);
      setActiveTab('lawyers');
      setShowLawyerSuggestion(false);
    }
  };

  const handleDismissLawyerSuggestion = () => {
    setShowLawyerSuggestion(false);
  };

  const handleConfirmNeedLawyer = () => {
    if (onNeedLawyer) {
      onNeedLawyer();
      setShowLawyerSuggestion(false);
    }
  };

  const getScrollAreaHeight = () => {
    if (isMobile) {
      return 'h-[calc(100vh-360px)]';
    } else {
      return 'h-[calc(100vh-240px)]';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {activeDocument ? (
        <div className="px-4 py-3 border-b flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            {activeDocument.type === 'pdf' ? <FileText size={18} className="text-blue-700" /> : <Image size={18} className="text-blue-700" />}
          </div>
          <div className="flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-medium text-sm truncate">{truncateName(activeDocument.name)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white">
                <p>{activeDocument.name}</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-gray-500">Ostatnia aktywność: {activeDocument.date}</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b">
          <p className="text-center text-gray-500">Nie wybrano dokumentu</p>
        </div>
      )}

      <ScrollArea className={`flex-1 ${getScrollAreaHeight()}`}>
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center mb-1 text-blue-600">
                    <MessageSquare size={14} className="mr-1" />
                    <span className="text-xs font-medium">Asystent AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}

          {showLawyerSuggestion && (
            <div className="flex justify-start">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-[85%]">
                <div className="flex items-center mb-2 text-blue-600">
                  <MessageSquare size={16} className="mr-1" />
                  <span className="text-sm font-medium">Asystent AI</span>
                </div>
                <p className="text-sm mb-3">Czy potrzebujesz pomocy prawnika w tej sprawie?</p>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleConfirmNeedLawyer}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tak, znajdź prawnika
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDismissLawyerSuggestion}
                  >
                    Nie, dziękuję
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="sticky bottom-0 bg-white border-t border-t-transparent">
        <div className="p-2 flex justify-center">
          <button 
            className={`mx-1 px-4 py-2 ${!activeDocument ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-800'} text-xs font-medium rounded-full flex items-center`}
            onClick={handleAnalyzeDocument}
            disabled={!activeDocument}
          >
            <FileText size={14} className="mr-1" />
            Analizuj dokument
          </button>
          
          {!isMobile && (
            <button 
              className="mx-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center"
              onClick={handleOpenFileDialog}
            >
              <FilePlus size={14} className="mr-1" />
              Dodaj dokument
            </button>
          )}
          
          <button 
            className={`mx-1 px-4 py-2 ${isListening ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-800'} text-xs font-medium rounded-full flex items-center`}
            onClick={toggleMicrophone}
          >
            {isListening ? <MicOff size={14} className="mr-1" /> : <Mic size={14} className="mr-1" />}
            {isListening ? 'Wyłącz mikrofon' : 'Włącz mikrofon'}
          </button>
        </div>

        <div className={`p-3 flex items-center relative ${isMobile ? 'mb-4' : ''}`}>
          <input
            type="text"
            placeholder="Zadaj pytanie o dokument..."
            className="flex-1 border rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="absolute right-4 p-2 text-blue-600"
            onClick={handleSendMessage}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
