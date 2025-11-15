
export interface WebSocketMessage {
  id?: string;
  type: string;
  text?: string;
  timestamp?: string;
  error?: string;
  action_type?: string;
  payload?: any;
}

export type WebSocketEventHandler = (event: CustomEvent) => void;
