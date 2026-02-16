export interface ChatMessage {
  id: string;
  destinationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
