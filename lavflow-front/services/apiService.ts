import { Client } from '../types';



/**
 * Simula uma chamada de API para buscar a lista de clientes.
 * @returns Uma promessa que resolve para uma lista de clientes.
 */
export const fetchClients = async (): Promise<Client[]> => {
  console.log('Fetching clients from API...');
  const response = await fetch(process.env.MAXPAN_API_URL + 'users/customer-stores?mask=false&showName=true&limit=1000', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MAXPAN_BEARER_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar clientes');
  }
  const clients: Client[] = await response.json();
  console.log('Clients fetched successfully.');
  console.log(clients);
  return clients;
};
