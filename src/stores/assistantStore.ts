
import { create } from 'zustand';
import { AssistantService } from '@/services/AssistantService';

export interface Message {
  id: number | string;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
  type?: string;
}

interface TempMessage {
  text: string;
  isComplete: boolean;
}

interface AssistantState {
  messages: Message[];
  tempMessage: TempMessage;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  service: AssistantService | null;
  
  // Actions
  setService: (service: AssistantService) => void;
  addMessage: (message: Message) => void;
  updateTempMessage: (text: string) => void;
  completeTempMessage: () => void;
  clearTempMessage: () => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  sendMessage: (text: string) => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  tempMessage: { text: '', isComplete: true },
  isConnected: false,
  isLoading: false,
  error: null,
  service: null,
  
  setService: (service: AssistantService) => {
    set({ service });
    
    // Setup event handlers
    service.on('messagesObtained', (event: CustomEvent) => {
      if (event.detail) {
        const message: Message = {
          id: event.detail.id || Date.now(),
          sender: 'ai',
          content: event.detail.text || '',
          timestamp: event.detail.timestamp,
          type: event.detail.type
        };
        
        get().addMessage(message);
      }
    });
    
    service.on('messageUpdated', (event: CustomEvent) => {
      if (event.detail) {
        set((state) => ({
          tempMessage: {
            text: event.detail.text || '',
            isComplete: false
          }
        }));
      }
    });
    
    service.on('messageCompleted', (event: CustomEvent) => {
      get().completeTempMessage();
    });
    
    service.on('connected', () => {
      set({ isConnected: true });
    });
    
    service.on('disconnected', () => {
      set({ isConnected: false });
    });
    
    service.on('inProgress', () => {
      set({ isLoading: true });
    });
    
    service.on('error', (event: CustomEvent) => {
      set({ 
        error: event.detail?.error || 'Unknown error',
        isLoading: false
      });
    });
  },
  
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
      isLoading: false
    }));
  },
  
  updateTempMessage: (text: string) => {
    set((state) => ({
      tempMessage: { text, isComplete: false }
    }));
  },
  
  completeTempMessage: () => {
    const { tempMessage } = get();
    
    if (tempMessage.text) {
      const newMessage: Message = {
        id: Date.now(),
        sender: 'ai',
        content: tempMessage.text
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage],
        tempMessage: { text: '', isComplete: true },
        isLoading: false
      }));
    }
  },
  
  clearTempMessage: () => {
    set({
      tempMessage: { text: '', isComplete: true }
    });
  },
  
  setIsConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },
  
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  sendMessage: (text: string) => {
    const { service } = get();
    
    if (service) {
      // Add user message to the state
      const userMessage: Message = {
        id: Date.now(),
        sender: 'user',
        content: text
      };
      
      get().addMessage(userMessage);
      
      // Send to the service
      service.sendMessage(text);
      set({ isLoading: true });
    } else {
      set({ error: 'Assistant service not available' });
    }
  }
}));
