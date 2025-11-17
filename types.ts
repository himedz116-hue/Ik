export interface Message {
  sender: 'user' | 'ai';
  text: string;
  type?: 'document' | 'general';
}

export interface FileContent {
  name: string;
  type: string; // mimeType
  content: string; // text for PDF, base64 for images
}
