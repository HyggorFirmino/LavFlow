import { Client, Store } from '../types';
import { updateStore } from './storeService';

const API_URL = process.env.NEXT_PUBLIC_MAXPAN_URL;

let clientsCache: Client[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

/**
 * Retrieves the Bearer token for the Maxpan API.
 * Priority: Store.BearerTokenMaxpan > env variable
 * LocalStorage fallback has been removed to rely exclusively on database storage.
 */
export const getAccessToken = (store?: Store | null): string => {
  // 1. Try from Store (database)
  if (store?.BearerTokenMaxpan) {
    return store.BearerTokenMaxpan;
  }
  console.warn('getAccessToken: BearerTokenMaxpan não encontrado na loja.');
  return '';
};

/**
 * Retrieves the Refresh token for the Maxpan API.
 * Priority: Store.refreshTokenMaxpan > env variable
 * LocalStorage fallback has been removed to rely exclusively on database storage.
 */
export const getRefreshToken = (store?: Store | null): string => {
  // 1. Try from Store (database)
  if (store?.refreshTokenMaxpan) {
    return store.refreshTokenMaxpan;
  }
  console.warn('getRefreshToken: refreshTokenMaxpan não encontrado na loja.');
  return '';
};

/**
 * Attempts to refresh the Maxpan token using the store's refresh token.
 * If a store is provided, the new tokens are also saved back to the database.
 */
export const refreshTokenFn = async (store?: Store | null): Promise<boolean> => {
  const token = getRefreshToken(store);
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
    
    // Tratando diferentes formatos de resposta de APIs de token
    const newAccessToken = data?.access?.token || data?.accessToken || data?.token || data?.tokens?.access?.token;
    const newRefreshToken = data?.refresh?.token || data?.refreshToken || data?.refresh_token || data?.tokens?.refresh?.token;
    
    // Tratando as validades
    const newAccessExpires = data?.access?.expires || data?.accessExpires || data?.expires_in || data?.tokens?.access?.expires;
    const newRefreshExpires = data?.refresh?.expires || data?.refreshExpires || data?.tokens?.refresh?.expires;

    if (newAccessToken && newRefreshToken) {
      // If we have a store, persist back to the database
      if (store && store.id) {
        // Mutate store reference in memory to ensure maxpanFetch can use the updated token immediately
        store.BearerTokenMaxpan = newAccessToken;
        store.refreshTokenMaxpan = newRefreshToken;

        if (newAccessExpires) store.BearerTokenMaxpanExpiration = newAccessExpires;
        if (newRefreshExpires) store.refreshTokenMaxpanExpiration = newRefreshExpires;

        try {
          await updateStore(String(store.id), {
            BearerTokenMaxpan: newAccessToken,
            refreshTokenMaxpan: newRefreshToken,
            BearerTokenMaxpanExpiration: newAccessExpires || undefined,
            refreshTokenMaxpanExpiration: newRefreshExpires || undefined,
          });
          console.log('Tokens Maxpan atualizados no banco de dados para a loja', store.name || store.id);
        } catch (err) {
          console.error('Falha ao salvar tokens atualizados no banco:', err);
        }
      } else {
        console.warn('refreshTokenFn: token atualizado mas *nenhuma loja referenciada* para salvar no banco!');
      }

      return true;
    } else {
      console.error('refreshTokenFn: Formato de retorno da Maxpan não reconhecido, dados:', data);
    }
    return false;

  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    return false;
  }
};

/**
 * Core fetch wrapper for Maxpan API calls.
 * Uses the store's BearerTokenMaxpan from the database.
 * On 401, attempts to refresh the token and retry.
 */
export const maxpanFetch = async (endpoint: string, options: RequestInit = {}, store?: Store | null): Promise<Response> => {
  const token = getAccessToken(store);
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
    const refreshed = await refreshTokenFn(store);
    if (refreshed) {
      const newToken = getAccessToken(store); // from store object after refresh memory mutation
      const refreshedHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: refreshedHeaders });
    }

    if (response.status === 401 || !refreshed) {
      console.warn('maxpanFetch: Falha irreversível na autenticação. Token inválido ou não foi possível renovar.');
      
      if (typeof window !== 'undefined' && !(window as any).isAlerting401) {
        (window as any).isAlerting401 = true;
        window.dispatchEvent(new CustomEvent('maxpan-auth-error'));
        setTimeout(() => { (window as any).isAlerting401 = false; }, 5000);
      }
      
      throw new Error('Falha de autenticação (401). O token da Maxpan expirou ou é inválido.');
    }
  }

  return response;
};

/**
 * Busca a lista de clientes da Maxpan.
 */
export const fetchClients = async (storeMaxpanId?: string, store?: Store | null): Promise<Client[]> => {
  if (!storeMaxpanId) {
    console.warn('fetchClients: maxpanId não fornecido. Retornando lista vazia.');
    return [];
  }

  try {
    const url = `users/customer-stores?mask=false&showName=true&limit=3000&store=${storeMaxpanId}`;

    const response = await maxpanFetch(url, { method: 'GET' }, store);

    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }

    const data = await response.json();
    console.log('Resposta da API:', data);

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
    lastFetchTime = Date.now();

    return mappedClients;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

/**
 * Busca um cliente por CPF
 */
export const searchCustomerByCpf = async (cpf: string, storeMaxpanId?: string, store?: Store | null): Promise<any> => {
  try {
    let url = `users/customer-stores?page=1&mask=true&showName=true&limit=1000&documentId=${cpf}`;

    if (storeMaxpanId) {
      url += `&store=${storeMaxpanId}`;
    }

    const response = await maxpanFetch(url, { method: 'GET' }, store);

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
 */
export const createRecharge = async (rechargeData: {
  amount: number;
  amountPay: number;
  customer: any;
  paymentType: string;
  store: string;
}, store?: Store | null): Promise<any> => {
  try {
    const response = await maxpanFetch('orders', {
      method: 'POST',
      body: JSON.stringify({
        ...rechargeData,
        isBalancePurchase: true,
      }),
    }, store);

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
 */
export const getStoreOrders = async (storeId: string, store?: Store | null): Promise<any> => {
  try {
    const url = `orders?page=1&limit=1000&mask=true&showName=true&storeId=${storeId}&period=today`;
    console.log('Fetching orders from:', url);
    const response = await maxpanFetch(url, { method: 'GET' }, store);

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
