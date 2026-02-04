import { Client, LoginCredentials } from '../types';

const API_URL = process.env.NEXT_PUBLIC_MAXPAN_URL;

let clientsCache: Client[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      return localToken;
    }
    const envToken = process.env.NEXT_PUBLIC_MAXPAN_BEARER_TOKEN;
    if (envToken) {
      localStorage.setItem('accessToken', envToken);
      return envToken;
    }
  }
  return process.env.NEXT_PUBLIC_MAXPAN_BEARER_TOKEN || '';
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('refreshToken');
    if (localToken) {
      return localToken;
    }
    const envToken = process.env.NEXT_PUBLIC_MAXPAN_REFRESH_TOKEN;
    if (envToken) {
      localStorage.setItem('refreshToken', envToken);
      return envToken;
    }
  }
  return process.env.NEXT_PUBLIC_MAXPAN_REFRESH_TOKEN || '';
};



export const refreshToken = async (): Promise<boolean> => {
  const token = getRefreshToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    console.log('Dados do token atualizado:', data);
    // Adjust based on actual response structure if needed, assuming data.access.token and data.refresh.token
    const newAccessToken = data.access?.token || data.accessToken;
    const newRefreshToken = data.refresh?.token || data.refreshToken;

    if (newAccessToken && newRefreshToken) {
      saveTokens(newAccessToken, newRefreshToken);
      return true;
    }
    return false;

  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    return false;
  }
};

const maxpanFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      };
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: newHeaders,
      });
    }
  }

  return response;
};

/**
 * Simula uma chamada de API para buscar a lista de clientes.
 * @returns Uma promessa que resolve para uma lista de clientes.
 */
export const fetchClients = async (): Promise<Client[]> => {
  const now = Date.now();
  if (clientsCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Retornando clientes do cache');
    return clientsCache;
  }

  try {
    const response = await maxpanFetch(
      `users/customer-stores?mask=false&showName=true&limit=1000`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }

    const data = await response.json();
    console.log('Resposta da API:', data);

    // Ajuste conforme o formato real da resposta
    const clientsArray = Array.isArray(data) ? data : data.results ?? [];
    console.log('Array de clientes:', clientsArray);

    const mappedClients = clientsArray.map((item: any) => ({
      id: item.customer || item.id || '',
      name: item.fullName || item.name || '',
      document: item.documentId || item.document || '',
      phone: item.cellphone || item.phone || '',
      saldo: item.rechargeBalance || 0,
    }));

    clientsCache = mappedClients;
    lastFetchTime = now;

    return mappedClients;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};
