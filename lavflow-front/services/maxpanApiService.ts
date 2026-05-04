import { Client, Store } from '../types';
import { chamarApiExterna } from './proxyService';

let clientsCache: Client[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

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

    const data = await chamarApiExterna('GET', url, String(store?.id || ''));
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
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    // Simula a falha irreversível de autenticação se for 401 para disparar o evento, caso o proxy repasse 401
    if (error?.status === 401) {
      if (typeof window !== 'undefined' && !(window as any).isAlerting401) {
        (window as any).isAlerting401 = true;
        window.dispatchEvent(new CustomEvent('maxpan-auth-error'));
        setTimeout(() => { (window as any).isAlerting401 = false; }, 5000);
      }
    }
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

    const data = await chamarApiExterna('GET', url, String(store?.id || ''));

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error: any) {
    console.error('Erro ao buscar cliente por CPF:', error);
    throw new Error(error?.message || 'Erro ao buscar cliente.');
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
    const data = await chamarApiExterna('POST', 'orders', String(store?.id || ''), {
      ...rechargeData,
      isBalancePurchase: true,
    });

    return data;
  } catch (error: any) {
    console.error('Erro ao criar recarga:', error);
    throw new Error(error?.message || 'Erro ao realizar a recarga.');
  }
};

/**
 * Busca os pedidos de hoje para uma loja específica
 */
export const getStoreOrders = async (storeId: string, store?: Store | null): Promise<any> => {
  try {
    const url = `orders?page=1&limit=1000&mask=true&showName=true&storeId=${storeId}&period=today`;
    console.log('Fetching orders from:', url);
    
    const data = await chamarApiExterna('GET', url, String(store?.id || ''));
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar ordens da loja:', error);
    throw new Error(error?.message || 'Erro ao buscar ordens da loja.');
  }
};

