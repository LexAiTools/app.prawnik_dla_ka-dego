
import React from 'react';
import { FileText, MessageSquare, Plus, X, Upload, Camera, Users, HandIcon } from 'lucide-react';

interface NavigationBarProps {
  activeTab: 'chat' | 'documents' | 'lawyers';
  setActiveTab: (tab: 'chat' | 'documents' | 'lawyers') => void;
  setShowUploadOptions: (show: boolean) => void;
  showUploadOptions: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  handleCameraCapture: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowMediator: () => void;
}

const NavigationBar = ({ 
  activeTab, 
  setActiveTab, 
  setShowUploadOptions,
  showUploadOptions,
  fileInputRef,
  cameraInputRef,
  handleCameraCapture,
  handleFileUpload,
  onShowMediator
}: NavigationBarProps) => {
  // Helper function to trigger file input click
  const handleFileButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <nav className="bg-blue-950 p-2">
      <div className="grid grid-cols-5 items-center relative">
        {/* First column - Documents button */}
        <div className="flex justify-center">
          <button 
            className={`p-2 rounded-full flex flex-col items-center ${activeTab === 'documents' ? 'text-white' : 'text-blue-300'}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={20} />
            <span className="text-xs mt-1">Dokumenty</span>
          </button>
        </div>
        
        {/* Second column - Mediator */}
        <div className="flex justify-center">
          <button 
            className="p-2 rounded-full flex flex-col items-center text-blue-300"
            onClick={onShowMediator}
          >
            <HandIcon size={20} />
            <span className="text-xs mt-1">Mediator</span>
          </button>
        </div>
        
        {/* Third column - Empty */}
        <div className="flex justify-center">
          {/* This column is intentionally left empty - for the center button */}
        </div>
        
        {/* Fourth column - Lawyers */}
        <div className="flex justify-center">
          <button 
            className={`p-2 rounded-full flex flex-col items-center ${activeTab === 'lawyers' ? 'text-white' : 'text-blue-300'}`}
            onClick={() => setActiveTab('lawyers')}
          >
            <Users size={20} />
            <span className="text-xs mt-1">Prawnicy</span>
          </button>
        </div>
        
        {/* Fifth column - Chat */}
        <div className="flex justify-center">
          <button 
            className={`p-2 rounded-full flex flex-col items-center ${activeTab === 'chat' ? 'text-white' : 'text-blue-300'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Czat</span>
          </button>
        </div>
        
        {/* Center button (floating) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
          <button 
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg"
            onClick={() => setShowUploadOptions(!showUploadOptions)}
          >
            <Plus size={24} />
          </button>
          
          {/* Opcje dodawania dokumentu */}
          {showUploadOptions && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-1 w-40 text-gray-800">
              <div 
                className="w-full flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={handleFileButtonClick}
              >
                <Upload size={16} className="mr-2 text-blue-600" />
                <span className="text-sm">Dodaj dokument</span>
              </div>
              <div 
                className="w-full flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={handleCameraCapture}
              >
                <Camera size={16} className="mr-2 text-blue-600" />
                <span className="text-sm">Zrób zdjęcie</span>
              </div>
              
              <button 
                className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-1"
                onClick={() => setShowUploadOptions(false)}
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.txt"
            onChange={handleFileUpload}
          />
          
          {/* Input for camera capture */}
          <input
            type="file"
            ref={cameraInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
