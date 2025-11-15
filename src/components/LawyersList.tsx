import React, { useState } from 'react';
import { User, MessageSquare, Star, Briefcase, Eye, Send, FileText, Image } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Lawyer } from './AsystentPrawny';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Document } from './AsystentPrawny';

interface LawyersListProps {
  lawyers: Lawyer[];
  documents: Document[];
  activeLawyer: Lawyer | null;
  setActiveLawyer: (lawyer: Lawyer) => void;
  setActiveTab: (tab: 'chat' | 'documents' | 'lawyers') => void;
  onSendInquiry?: (lawyerId: number, message: string, attachConversation: boolean, attachedDocumentIds: (string | number)[]) => void;
}

const LawyersList = ({
  lawyers,
  documents,
  activeLawyer,
  setActiveLawyer,
  setActiveTab,
  onSendInquiry
}: LawyersListProps) => {
  const isMobile = useIsMobile();
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [previewLawyer, setPreviewLawyer] = useState<Lawyer | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [attachConversation, setAttachConversation] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<(string | number)[]>([]);
  
  const getScrollAreaHeight = () => {
    if (isMobile) {
      return 'h-[calc(100vh-220px)]';
    } else {
      return 'h-[calc(100vh-160px)]';
    }
  };
  
  const handlePreviewClick = (e: React.MouseEvent, lawyer: Lawyer) => {
    e.stopPropagation();
    setPreviewLawyer(lawyer);
    setIsPreviewDialogOpen(true);
  };
  
  const handleInquiryClick = (e: React.MouseEvent, lawyer: Lawyer) => {
    e.stopPropagation();
    setPreviewLawyer(lawyer);
    setIsInquiryDialogOpen(true);
  };
  
  const handleSendInquiry = () => {
    if (previewLawyer && onSendInquiry) {
      onSendInquiry(
        previewLawyer.id, 
        inquiryMessage, 
        attachConversation, 
        selectedDocuments
      );
      setIsInquiryDialogOpen(false);
      setInquiryMessage('');
      setAttachConversation(false);
      setSelectedDocuments([]);
    }
  };
  
  const toggleDocumentSelection = (documentId: string | number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Prawnicy</h2>
      </div>
      
      <ScrollArea className={getScrollAreaHeight()}>
        <ul className="space-y-3 pr-4">
          {lawyers.map((lawyer) => (
            <li key={lawyer.id}>
              <div className="relative">
                <button 
                  className={`w-full flex items-center p-3 rounded-lg ${activeLawyer && activeLawyer.id === lawyer.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setActiveLawyer(lawyer);
                    setActiveTab('chat');
                  }}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 mr-3 flex items-center justify-center overflow-hidden">
                    {lawyer.photoUrl ? (
                      <img src={lawyer.photoUrl} alt={lawyer.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={24} className="text-blue-700" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{lawyer.name}</p>
                    <p className="text-xs text-gray-500">{lawyer.specialization}</p>
                    <div className="flex items-center mt-1">
                      {renderRating(lawyer.rating)}
                      <span className="text-xs text-gray-500 ml-1">({lawyer.reviewsCount})</span>
                    </div>
                  </div>
                  {(!activeLawyer || activeLawyer.id === lawyer.id) && (
                    <div className="flex">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                            onClick={(e) => handlePreviewClick(e, lawyer)}
                            aria-label="Podgląd profilu"
                          >
                            <Eye size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Profil prawnika</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="p-2 text-gray-500 hover:text-green-500 hover:bg-gray-100 rounded-full"
                            onClick={(e) => handleInquiryClick(e, lawyer)}
                            aria-label="Wyślij zapytanie"
                          >
                            <Send size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Wyślij zapytanie</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Profil prawnika</DialogTitle>
          </DialogHeader>
          
          {previewLawyer && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 mr-4 flex items-center justify-center overflow-hidden">
                  {previewLawyer.photoUrl ? (
                    <img src={previewLawyer.photoUrl} alt={previewLawyer.name} className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-blue-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{previewLawyer.name}</h3>
                  <p className="text-sm text-gray-600">{previewLawyer.specialization}</p>
                  <div className="flex items-center mt-1">
                    {renderRating(previewLawyer.rating)}
                    <span className="text-xs text-gray-500 ml-1">({previewLawyer.reviewsCount} opinii)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm flex items-center mb-1">
                  <Briefcase size={16} className="mr-1 text-blue-600" />
                  Doświadczenie
                </h4>
                <p className="text-sm text-gray-700">{previewLawyer.experience} lat</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">O mnie</h4>
                <p className="text-sm text-gray-700">{previewLawyer.bio}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Specjalizacje</h4>
                <div className="flex flex-wrap gap-2">
                  {previewLawyer.expertiseAreas.map((area, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => {
                  setIsPreviewDialogOpen(false);
                  const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent<Element, MouseEvent>;
                  handleInquiryClick(fakeEvent, previewLawyer);
                }}>
                  Wyślij zapytanie
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zapytanie do prawnika</DialogTitle>
            {previewLawyer && (
              <DialogDescription>
                Wyślij zapytanie do: <span className="font-medium">{previewLawyer.name}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Tabs defaultValue="message">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="message">Wiadomość</TabsTrigger>
              <TabsTrigger value="attachments">Załączniki</TabsTrigger>
            </TabsList>
            
            <TabsContent value="message" className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Treść zapytania</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Opisz swoje pytanie lub problem prawny..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="attachConversation"
                  checked={attachConversation}
                  onCheckedChange={(checked) => setAttachConversation(checked as boolean)}
                />
                <label 
                  htmlFor="attachConversation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Dołącz transkrypcję rozmowy z asystentem
                </label>
              </div>
            </TabsContent>
            
            <TabsContent value="attachments">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Wybierz dokumenty do załączenia:</h4>
                <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center p-3">
                      <Checkbox 
                        id={`doc-${doc.id}`}
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      />
                      <label htmlFor={`doc-${doc.id}`} className="ml-3 flex items-center cursor-pointer flex-1">
                        <div className="bg-blue-100 p-2 rounded-lg mr-2">
                          {doc.type === 'pdf' ? 
                            <FileText size={16} className="text-blue-700" /> : 
                            <Image size={16} className="text-blue-700" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.date}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                  
                  {documents.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Brak dokumentów do załączenia
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInquiryDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleSendInquiry}
              disabled={inquiryMessage.trim() === ''}
            >
              Wyślij zapytanie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawyersList;
