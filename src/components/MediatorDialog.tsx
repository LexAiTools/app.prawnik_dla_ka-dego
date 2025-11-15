
import React, { useState } from 'react';
import { HandIcon, PlayCircle, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface MediatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MediatorDialog = ({ open, onOpenChange }: MediatorDialogProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <HandIcon className="text-blue-600" />
            Jak działa Mediator?
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'h-[60vh]' : 'max-h-[70vh]'}`}>
          <div className="space-y-4 text-gray-700 px-1">
            <p className="text-sm">
              Masz czasem problem z domową kłótnią, której nie potraficie rozwiązać? 
              Nasz nowy Mediator pomoże wam spokojnie przedstawić swoje stanowiska 
              i znaleźć wspólne rozwiązanie. Wystarczy, że każda strona po kolei 
              opisze swoją perspektywę, a system zaproponuje kompromis uwzględniający 
              ważne punkty dla obu osób. Funkcja Mediator pojawi się wkrótce w naszej 
              aplikacji - pomożemy wam rozmawiać konstruktywnie!
            </p>
            
            <div className="flex flex-col pt-4 pb-2">
              <Button 
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open("https://youtube.com/shorts/pJxBRpOFsXA?feature=share", "_blank")}
              >
                <PlayCircle size={20} />
                Zobacz jak to działa
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MediatorDialog;
