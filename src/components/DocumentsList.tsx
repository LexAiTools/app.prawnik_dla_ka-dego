import React, { useState } from 'react';
import { FileText, Image, Plus, Trash2, Eye } from 'lucide-react';
import { Document } from './AsystentPrawny';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';

interface DocumentsListProps {
  documents: Document[];
  activeDocument: Document;
  setActiveDocument: (document: Document) => void;
  setActiveTab: (tab: 'chat' | 'documents') => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onDeleteDocument?: (documentId: string | number) => void;
  setShowUploadOptions?: (show: boolean) => void;
}

const DocumentsList = ({ 
  documents, 
  activeDocument, 
  setActiveDocument, 
  setActiveTab,
  fileInputRef,
  onDeleteDocument,
  setShowUploadOptions
}: DocumentsListProps) => {
  const isMobile = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [anonymizedContent, setAnonymizedContent] = useState<string>('');
  
  const getScrollAreaHeight = () => {
    if (isMobile) {
      return 'h-[calc(100vh-220px)]';
    } else {
      return 'h-[calc(100vh-160px)]';
    }
  };
  
  const getPreviewContentHeight = () => {
    if (isMobile) {
      return 'h-[50vh]';
    } else {
      return 'h-96';
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setDocumentToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation === 'USUŃ' && documentToDelete && onDeleteDocument) {
      onDeleteDocument(documentToDelete.id);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation('');
      setDocumentToDelete(null);
    }
  };
  
  const fetchDocumentContent = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const text = await data.text();
      return text;
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Błąd pobierania zawartości dokumentu');
      return 'Błąd pobierania zawartości dokumentu';
    }
  };

  const handlePreviewClick = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setPreviewDocument(doc);
    
    let documentContent = 'Ładowanie zawartości dokumentu...';
    setAnonymizedContent(documentContent);
    setIsPreviewDialogOpen(true);
    
    if (doc.file_path) {
      documentContent = await fetchDocumentContent(doc.file_path);
    } else {
      documentContent = doc.content || 'Nie znaleziono zawartości dokumentu.';
    }
    
    const anonymized = anonymizeText(documentContent);
    setAnonymizedContent(anonymized);
  };
  
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };
  
  const anonymizeText = (text: string): string => {
    let anonymized = text.replace(/[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+ [A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/g, 'XXXXX XXXXX');
    
    anonymized = anonymized.replace(/ul\.\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\s]+ \d+\/?\d*/g, 'ul. XXXXX XX/XX');
    anonymized = anonymized.replace(/\d{2}-\d{3} [A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/g, 'XX-XXX XXXXX');
    
    anonymized = anonymized.replace(/PESEL:?\s+\d{11}/g, 'PESEL: XXXXXXXXXXX');
    anonymized = anonymized.replace(/\d{11}/g, 'XXXXXXXXXXX');
    
    anonymized = anonymized.replace(/\+?\d{2}\s?\d{3}\s?\d{3}\s?\d{3}/g, '+XX XXX XXX XXX');
    anonymized = anonymized.replace(/\d{3}[\s-]?\d{3}[\s-]?\d{3}/g, 'XXX-XXX-XXX');
    
    anonymized = anonymized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'xxxxx@xxxxx.xx');
    
    anonymized = anonymized.replace(/KRS:?\s+\d{10}/g, 'KRS: XXXXXXXXXX');
    
    anonymized = anonymized.replace(/Sygn\.\s+akt:?\s+[A-Z]+\s+[A-Z]+\s+\d+\/\d+/g, 'Sygn. akt: XX X XXXX/XX');
    anonymized = anonymized.replace(/[A-Z]+\s+[A-Z]+\s+\d+\/\d+/g, 'XX X XXXX/XX');
    
    anonymized = anonymized.replace(/faktur[ayę] nr \d+\/\d+/g, 'fakturę nr XXX/XXXX');
    anonymized = anonymized.replace(/\d+\/\d+/g, 'XXX/XXXX');
    
    return anonymized;
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Twoje dokumenty</h2>
          {!isMobile && fileInputRef && (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="ml-3 flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              Dokument
            </Button>
          )}
        </div>
        {isMobile && setShowUploadOptions ? (
          <button 
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md"
            onClick={() => setShowUploadOptions(true)}
          >
            <Plus size={20} />
          </button>
        ) : null}
      </div>
      
      <ScrollArea className={getScrollAreaHeight()}>
        <ul className="space-y-3 pr-4">
          {documents.map((doc) => (
            <li key={doc.id}>
              <div className="relative">
                <button 
                  className={`w-full flex items-center p-3 rounded-lg ${activeDocument.id === doc.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setActiveDocument(doc);
                    setActiveTab('chat');
                  }}
                >
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    {doc.type === 'pdf' ? <FileText size={18} className="text-blue-700" /> : <Image size={18} className="text-blue-700" />}
                  </div>
                  <div className="flex-1 text-left">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium text-sm truncate">{truncateName(doc.name)}</p>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white">
                        <p>{doc.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-xs text-gray-500">Ostatnia aktywność: {doc.date}</p>
                  </div>
                  {activeDocument.id === doc.id && (
                    <div className="flex">
                      <button
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                        onClick={(e) => handlePreviewClick(e, doc)}
                        aria-label="Podgląd dokumentu"
                      >
                        <Eye size={18} />
                      </button>
                      {onDeleteDocument && (
                        <button
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
                          onClick={(e) => handleDeleteClick(e, doc)}
                          aria-label="Usuń dokument"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Usunąć dokument?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {documentToDelete && (
                <>
                  <p className="mb-4">
                    Czy na pewno chcesz usunąć dokument <span className="font-semibold">{documentToDelete.name}</span>?
                  </p>
                  <p className="mb-4">To działanie jest nieodwracalne.</p>
                  <p>Wpisz <strong>USUŃ</strong> aby potwierdzić:</p>
                  <Input 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Wpisz USUŃ"
                    className="mt-2 text-black"
                  />
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmation('');
                setDocumentToDelete(null);
              }}
            >
              Anuluj
            </AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'USUŃ'}
            >
              Usuń dokument
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className={`bg-white ${isMobile ? 'sm:max-w-[95%] h-[90vh] max-h-[90vh] overflow-hidden' : 'sm:max-w-3xl'}`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              Podgląd zanonimizowanego dokumentu
              {previewDocument && <span className="ml-2 font-normal text-gray-500 hidden md:inline">({previewDocument.name})</span>}
            </DialogTitle>
            {previewDocument && isMobile && (
              <p className="text-xs text-gray-500">({previewDocument.name})</p>
            )}
            <DialogDescription>
              Poniżej przedstawiony jest zanonimizowany podgląd dokumentu. Wszystkie dane osobowe i wrażliwe zostały zastąpione symbolami X.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-auto whitespace-pre-wrap text-black ${getPreviewContentHeight()}`}>
              {anonymizedContent}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Dokument został automatycznie zanonimizowany. Algorytm mógł nie rozpoznać wszystkich danych wrażliwych.
            </p>
          </div>
          
          <div className="flex justify-end mt-2">
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsList;
