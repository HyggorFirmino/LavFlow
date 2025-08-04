import { Client } from '../types';

const mockClients: Client[] = [
  { id: 'client-1', name: 'João Silva', document: '123.456.789-00', phone: '11 98765-4321' },
  { id: 'client-2', name: 'Maria Oliveira', document: '987.654.321-11', phone: '21 91234-5678' },
  { id: 'client-3', name: 'Carlos Pereira', document: '111.222.333-44', phone: '31 99999-8888' },
  { id: 'client-4', name: 'Ana Costa', document: '444.555.666-77', phone: '11 98765-1122' },
  { id: 'client-5', name: 'Mariana Lima', document: '777.888.999-00', phone: '41 98877-6655' },
  { id: 'client-6', name: 'Pedro Martins', document: '222.333.444-55', phone: '51 97766-5544' },
  { id: 'client-7', name: 'Fernanda Souza', document: '666.777.888-99', phone: '81 91122-3344' },
];

/**
 * Simula uma chamada de API para buscar a lista de clientes.
 * @returns Uma promessa que resolve para uma lista de clientes.
 */
export const fetchClients = async (): Promise<Client[]> => {
  console.log('Fetching clients from API...');
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Clients fetched successfully.');
  return mockClients;
};
