
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Mic, FilePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import './ChatInterface.css';

interface ExampleTask {
  id: string;
  text: string;
}

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Example tasks that will be scrollable
  const exampleTasks: ExampleTask[] = [
    { id: '1', text: 'Sprawdź zagrożenia' },
    { id: '2', text: 'Znajdź wątki' },
    { id: '3', text: 'Zanalizuj dokument' },
    { id: '4', text: 'Wygeneruj pytania' },
    { id: '5', text: 'Porównaj dokumenty' },
    { id: '6', text: 'Wyjaśnij pojęcia' },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      // Here you would integrate with your assistant service
      setMessage('');
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 150; // Adjust as needed
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleTaskClick = (task: ExampleTask) => {
    setMessage(task.text);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-200px)] bg-white rounded-lg shadow-md">
      <div className="flex-grow p-4 overflow-y-auto">
        {/* Chat messages would go here */}
        {isTyping && (
          <div className="flex items-center text-gray-500 mt-2">
            <div className="ml-2">Asystent pisze...</div>
          </div>
        )}
      </div>
      
      {/* Example tasks scrollable area */}
      <div className="px-4 mb-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full flex-shrink-0 z-20"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide py-2 space-x-2 flex-grow"
          >
            {exampleTasks.map(task => (
              <Button
                key={task.id}
                variant="outline"
                className="flex-shrink-0 whitespace-nowrap text-sm"
                onClick={() => handleTaskClick(task)}
              >
                {task.text}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full flex-shrink-0 z-20"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Zadaj pytanie o dokument..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          
          <Button variant="outline" size="icon">
            <FilePlus className="h-5 w-5 text-blue-600" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Mic className="h-5 w-5 text-blue-600" />
          </Button>
          
          <Button 
            onClick={handleSend} 
            disabled={!message.trim()}
            variant="ghost" 
            size="icon"
          >
            <ArrowRight className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
