
export interface Client {
  customer: string;
  fullName: string;
  documentId: string;
  cellphone: string;
}

export interface CardTag {
  name: string;
  value?: string;
}

export interface CardHistoryEvent {
  timestamp: string;
  fromListId: string;
  toListId: string;
  fromListTitle: string;
  toListTitle: string;
}

export interface Card {
  id: string;
  customerName: string;
  customerDocument?: string;
  contact: string;
  notes: string;
  tags: CardTag[];
  listId: string;
  basketIdentifier?: string;
  notifiedAt?: string;
  serviceValue?: number;
  paymentMethod?: 'dinheiro' | 'pix';
  services?: {
    washing: boolean;
    drying: boolean;
  };
  createdAt: string;
  completedAt?: string;
  enteredDryerAt?: string;
  history?: CardHistoryEvent[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  cardLimit?: number | null;
  type?: 'default' | 'dryer' | 'lavadora';
  totalDryingTime?: number; // in minutes
  reminderInterval?: number; // in minutes
}

export type BoardData = Record<string, List>;

export type TagType = 'texto' | 'número';

export interface TagDefinition {
  name: string;
  color: string; // Tailwind CSS class e.g. 'bg-blue-100 text-blue-800'
  type: TagType;
}

export interface User {
  id:string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  theme: 'claro' | 'escuro';
}

export interface LaundryProfile {
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  servicePrices: {
    washing: number;
    drying: number;
    washingAndDrying: number;
  };
}

export interface ToastNotification {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}