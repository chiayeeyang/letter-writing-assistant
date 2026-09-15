export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GenerateResponse {
  text: string;
  error?: string;
}
