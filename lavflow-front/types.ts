
export interface LoginCredentials {
  email: string;
  password: string;
}


export interface Client {
  id: string;
  name: string;
  document: string; // Mantido para compatibilidade se usado em outro lugar
  cpf?: string;     // Adicionado para alinhar com o backend entity
  phone: string;
  birthDate?: string;
  address?: string;
  saldo: number;
}

export interface CardHistoryEvent {
  timestamp: string;
  fromListId: string;
  toListId: string;
  fromListTitle: string;
  toListTitle: string;
}

// Conforme a entidade OrdemServico do backend
export interface Card {
  id: string; // Convertido de number para string no frontend
  client?: Client; // Cliente vinculado
  customerName: string;
  customerDocument?: string;
  notes: string;
  contact: string;
  serviceValue?: number;
  paymentMethod?: 'dinheiro' | 'pix';
  tags: { name: string; value?: string }[];
  basketIdentifier?: string;
  notifiedAt?: string;
  services?: { washing: boolean; drying: boolean };
  createdAt: string; // Convertido de Date para string
  completedAt?: string; // Convertido de Date para string
  enteredDryerAt?: string;
  history?: CardHistoryEvent[];

  // Relacionamentos
  listId: string; // Vem de status.id
  funcionarioResponsavel?: any; // Simplificado por enquanto
}

// Conforme a entidade StatusKanban do backend
export interface List {
  id: string; // Convertido de number para string no frontend
  title: string; // Mapeado de 'titulo'
  order: number; // Mapeado de 'ordem'
  cardLimit?: number | null; // Mapeado de 'limiteCartoes'
  type?: 'default' | 'dryer' | 'lavadora' | 'whatsapp'; // Mapeado de 'tipo'
  totalDryingTime?: number | null; // Mapeado de 'tempoSecagemTotal'
  reminderInterval?: number | null; // Mapeado de 'intervaloLeitura'

  // Adicionado no frontend para conter os cartões
  cards: Card[];
}

export type BoardData = Record<string, List>;

export type TagType = 'texto' | 'número';

export interface TagDefinition {
  name: string;
  color: string; // Tailwind CSS class e.g. 'bg-blue-100 text-blue-800'
  type: TagType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'admin';
  theme: 'claro' | 'escuro';
  stores?: Store[];
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

export interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  operatingHours?: string;
  cnpj?: string;
  washingPrice?: number;
  dryingPrice?: number;
  comboPrice?: number;
}