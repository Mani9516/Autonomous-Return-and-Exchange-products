export enum OrderStatus {
  DELIVERED = 'Delivered',
  RETURN_INITIATED = 'Return Initiated',
  RETURNED = 'Returned',
  EXCHANGE_INITIATED = 'Exchange Initiated',
  EXCHANGED = 'Exchanged'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  color: string;
  size: string;
  image: string;
  category: string;
  tags: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Order {
  orderId: string;
  userId: string; // Added for smart lookup
  customerName: string;
  date: string;
  status: OrderStatus;
  items: Product[];
  eligibleForReturn: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Simulated
  preferences?: string[];
  wishlist?: string[]; // List of Product IDs
}

export interface Attachment {
  type: 'image' | 'video';
  url: string; // Object URL for preview
  base64: string; // For API
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  attachment?: Attachment;
  isToolOutput?: boolean;
  toolName?: string;
  recommendations?: Product[];
  analysisResult?: {
    status: string;
    detected_objects: string[];
    confidence: number;
    analysis_time_ms: number;
  };
}

export interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
  agent: 'Communication' | 'Vision' | 'Policy' | 'Resolution' | 'System' | 'Database' | 'NLP';
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface NlpState {
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  confidence: number;
  entities: string[];
}