
type MessageHandler = (event: CustomEvent) => void;

export interface AssistantOptions {
  baseUrl?: string;
  debug?: boolean;
}

export class AssistantService {
  private socket: WebSocket | null = null;
  private assistantId: string;
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any = null;
  private debug: boolean;

  constructor(assistantId: string, baseUrl: string = "wss://api.lexai.example.com", options: AssistantOptions = {}) {
    this.assistantId = assistantId;
    this.baseUrl = baseUrl;
    this.debug = options.debug || false;
    
    // Initialize connection
    this.connect();
    
    // Setup event listeners for the page
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }
  
  private log(...args: any[]) {
    if (this.debug) {
      console.log('[AssistantService]', ...args);
    }
  }

  public connect(): void {
    try {
      const wsUrl = `${this.baseUrl}/ws/${this.assistantId}`;
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = (event) => {
        this.log('Connected to assistant server');
        this.reconnectAttempts = 0;
        this.dispatchEvent('connected', {});
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.log('Received message:', data);
          
          if (data.type === 'message') {
            this.dispatchEvent('messagesObtained', data.message);
          } else if (data.type === 'update') {
            this.dispatchEvent('messageUpdated', data);
          } else if (data.type === 'completed') {
            this.dispatchEvent('messageCompleted', data);
          } else if (data.type === 'inProgress') {
            this.dispatchEvent('inProgress', data);
          } else if (data.type === 'error') {
            this.dispatchEvent('error', data);
          }
        } catch (error) {
          this.log('Error parsing message:', error);
          this.dispatchEvent('error', { error: 'Failed to parse message' });
        }
      };
      
      this.socket.onclose = (event) => {
        this.log('Connection closed:', event);
        this.handleReconnection();
      };
      
      this.socket.onerror = (error) => {
        this.log('WebSocket error:', error);
        this.dispatchEvent('error', { error: 'WebSocket connection error' });
      };
    } catch (error) {
      this.log('Failed to connect:', error);
      this.handleReconnection();
    }
  }
  
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
      
      this.dispatchEvent('reconnecting', { attempt: this.reconnectAttempts, delay });
    } else {
      this.dispatchEvent('disconnected', { reason: 'Max reconnect attempts reached' });
      this.log('Max reconnect attempts reached');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    clearTimeout(this.reconnectTimeout);
  }

  public sendMessage(message: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.dispatchEvent('error', { error: 'Not connected to server' });
      return;
    }
    
    const messageObj = {
      type: 'message',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    try {
      this.socket.send(JSON.stringify(messageObj));
      this.dispatchEvent('messageAdd', { text: message });
    } catch (error) {
      this.log('Error sending message:', error);
      this.dispatchEvent('error', { error: 'Failed to send message' });
    }
  }
  
  public sendAction(actionType: string, payload: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.dispatchEvent('error', { error: 'Not connected to server' });
      return;
    }
    
    const actionObj = {
      type: 'action',
      action_type: actionType,
      payload,
      timestamp: new Date().toISOString()
    };
    
    try {
      this.socket.send(JSON.stringify(actionObj));
      this.log('Action sent:', actionType);
    } catch (error) {
      this.log('Error sending action:', error);
      this.dispatchEvent('error', { error: 'Failed to send action' });
    }
  }
  
  private dispatchEvent(name: string, detail: any): void {
    const event = new CustomEvent(`assistant:${name}`, { detail });
    window.dispatchEvent(event);
  }
  
  public on(eventName: string, handler: MessageHandler): void {
    window.addEventListener(`assistant:${eventName}`, handler as EventListener);
  }
  
  public off(eventName: string, handler: MessageHandler): void {
    window.removeEventListener(`assistant:${eventName}`, handler as EventListener);
  }
}
