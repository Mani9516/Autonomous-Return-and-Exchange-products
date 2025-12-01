export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  purchasedDate?: string;
  orderId?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Simulated
  role: 'user' | 'admin';
}

export enum ReturnReason {
  DAMAGED_SHIPPING = "Damaged during shipping",
  DEFECTIVE_SCREEN = "Screen is cracked/defective",
  NOT_WORKING = "Item does not turn on",
  WRONG_ITEM = "Received wrong item",
  BETTER_PRICE = "Found better price elsewhere",
  NO_LONGER_NEEDED = "No longer needed",
  MISSING_PARTS = "Missing parts or accessories",
  QUALITY_ISSUES = "Performance/Quality not as expected",
  SIZE_FIT = "Item does not fit (Size/Dimensions)",
  ARRIVED_LATE = "Arrived too late"
}

export interface AgentLog {
  id: string;
  agentName: 'Vision Agent' | 'Policy Agent' | 'Resolution Agent' | 'Communication Agent' | 'SQL Database' | 'Auth Service' | 'Support Agent';
  status: 'processing' | 'success' | 'failure';
  message: string;
  details?: string; // JSON string or detailed text
  timestamp: number;
}

export interface ReturnCase {
  id: string;
  productId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'manual_review';
  imageUrl?: string;
  analysisReport?: string;
  resolutionNote?: string;
  refundAmount?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
