import { Client, LoginCredentials } from '../types';

const API_URL = process.env.NEXT_PUBLIC_MAXPAN_URL;

export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken')|| process.env.NEXT_PUBLIC_MAXPAN_BEARER_TOKEN;
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')||process.env.NEXT_PUBLIC_MAXPAN_REFRESH_TOKEN;
};

export const login = async (credentials: LoginCredentials): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return false;
    }

    const { accessToken, refreshToken } = await response.json();
    saveTokens(accessToken, refreshToken);
    return true;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return false;
  }
};

export const refreshToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}auth/refresh-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    console.log('Dados do token atualizado:', data);
    saveTokens(data.access.token, data.refresh.token);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    return false;
  }
};


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
          'Authorization': `Bearer ${getAccessToken()}`,
        },
      }
    );

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return fetchClients();
      }
    }

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
