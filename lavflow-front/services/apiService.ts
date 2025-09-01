import { Client } from '../types';

/**
 * Simula uma chamada de API para buscar a lista de clientes.
 * @returns Uma promessa que resolve para uma lista de clientes.
 */
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAXPAN_URL}users/customer-stores?mask=false&showName=true&limit=1000`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MAXPAN_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }

    const data = await response.json();
    console.log('Resposta da API:', data);

    // Ajuste conforme o formato real da resposta
    const clientsArray = Array.isArray(data) ? data : data.results ?? [];
    console.log('Array de clientes:', clientsArray);

    return clientsArray.map((item: any) => ({
      id: item.customer || item.id || '',
      name: item.fullName || item.name || '',
      document: item.documentId || item.document || '',
      phone: item.cellphone || item.phone || '',
      saldo: item.rechargeBalance || 0,
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};
