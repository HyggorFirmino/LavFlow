import { Client, LoginCredentials } from '../types';

const API_URL = process.env.NEXT_PUBLIC_MAXPAN_URL;
const selectedStoreId = process.env.NEXT_PUBLIC_SELECTED_STORE_ID;

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
    const response = await fetch(`${API_URL}auth/refresh-tokens`, {
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

export const maxpanFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
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
    // Step 2: try refreshing the token
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      const refreshedHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: refreshedHeaders });
    }

    // Step 3: if still 401 (or refresh failed), fall back to the raw .env bearer token
    if (response.status === 401 || !refreshed) {
      const envToken = process.env.NEXT_PUBLIC_MAXPAN_BEARER_TOKEN;
      if (envToken && envToken !== token) {
        console.warn('maxpanFetch: refresh falhou, tentando com token do .env como fallback.');
        const envHeaders = { ...headers, 'Authorization': `Bearer ${envToken}` };
        response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: envHeaders });
        // If the env token worked, persist it for next calls
        if (response.ok) {
          localStorage.setItem('accessToken', envToken);
        }
      }
    }
  }

  return response;
};

/**
 * Simula uma chamada de API para buscar a lista de clientes.
 * @returns Uma promessa que resolve para uma lista de clientes.
 */
export const fetchClients = async (storeMaxpanId?: string): Promise<Client[]> => {
  const now = Date.now();
  // Cache key could specific to store, but simplistic for now.
  // Ideally, cache should be a map: storeId -> clients.
  // For now, let's invalidate cache if storeId changes or just not use cache if storeId is provided?
  // Or simple:
  // if (clientsCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
  //   console.log('Retornando clientes do cache');
  //   return clientsCache;
  // }
  // Actually, since we are filtering by store now, a global cache is risky if we switch stores.
  // Let's clear cache if we fetch for a specific store or just bypass for now to be safe.
  // Or better, let's just fetch fresh.

  if (!storeMaxpanId) {
    console.warn('fetchClients: maxpanId não fornecido. Retornando lista vazia.');
    return [];
  }

  try {
    const url = `users/customer-stores?mask=false&showName=true&limit=3000&store=${storeMaxpanId}`;

    const response = await maxpanFetch(
      url,
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
      id: item.customer || item._id || item.id || '',
      name: item.fullName || item.name || '',
      document: item.documentId || item.cpf || item.document || '',
      phone: item.cellphone || item.phone || item.phoneNumber || '',
      email: item.email || '',
      birthDate: item.birthDate || item.birthday || item.dataNascimento || '',
      address: item.address || item.endereco || '',
      saldo: typeof item.rechargeBalance === 'number' ? item.rechargeBalance : 0,
    }));

    clientsCache = mappedClients;
    lastFetchTime = now;

    return mappedClients;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

/**
 * Busca um cliente por CPF
 * @param cpf CPF do cliente (apenas números)
 * @param storeMaxpanId ID da loja no Maxpan (opcional)
 * @returns Dados do cliente encontrado ou null
 */
export const searchCustomerByCpf = async (cpf: string, storeMaxpanId?: string): Promise<any> => {
  try {
    let url = `users/customer-stores?page=1&mask=true&showName=true&limit=1000&documentId=${cpf}`;

    if (storeMaxpanId) {
      url += `&store=${storeMaxpanId}`;
    }

    const response = await maxpanFetch(
      url,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar cliente.');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    throw error;
  }
};

/**
 * Cria uma recarga de crédito para um cliente
 * @param rechargeData Dados da recarga
 * @returns Resposta da API
 */
export const createRecharge = async (rechargeData: {
  amount: number;
  amountPay: number;
  customer: any;
  paymentType: string;
  store: string;
}): Promise<any> => {
  try {
    const response = await maxpanFetch('orders', {
      method: 'POST',
      body: JSON.stringify({
        ...rechargeData,
        store: rechargeData.store || selectedStoreId,
        isBalancePurchase: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao realizar a recarga.');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar recarga:', error);
    throw error;
  }
};

/**
 * Busca os pedidos de hoje para uma loja específica
 * @param storeId ID da loja
 * @returns Lista de pedidos (orders)
 */
export const getStoreOrders = async (storeId: string): Promise<any> => {
  try {
    const url = `orders?page=1&limit=1000&mask=true&showName=true&storeId=${storeId}&period=today`;
    console.log('Fetching orders from:', url);
    const response = await maxpanFetch(url, { method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar ordens da loja:', error);
    throw error;
  }
};
