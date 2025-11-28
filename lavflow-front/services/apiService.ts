import { Card, List } from '../types';

const API_URL = 'http://localhost:3001';

// Helper para centralizar as chamadas fetch e o tratamento de erros
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Ocorreu um erro na API');
  }

  if (response.status === 204) { // No Content
    return null as T;
  }

  return response.json();
}

// --- Funções da API para Ordens (Cards) ---

export const getOrdens = (): Promise<any[]> => {
  return apiFetch('/ordens');
};

export const createOrdem = (data: Partial<Card>): Promise<any> => {
    // O backend espera um `id_status` no corpo
    const payload = {
        ...data,
        id_status: Number(data.listId),
    };
    return apiFetch('/ordens', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateOrdemStatus = (ordemId: string, novoStatusId: string): Promise<any> => {
  return apiFetch(`/ordens/${ordemId}/mudar-status`, {
    method: 'PATCH',
    body: JSON.stringify({ novoStatusId: Number(novoStatusId) }),
  });
};

// --- Funções da API para Status (Lists) ---

export const getStatusKanban = (): Promise<any[]> => {
  return apiFetch('/status-kanban');
};

export const createList = (data: Partial<List>): Promise<any> => {
    const payload = {
        titulo: data.title,
        ordem: data.order,
        // ... outros campos que o DTO do backend espera
    };
    return apiFetch('/status-kanban', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateList = (id: string, data: Partial<List>): Promise<any> => {
  return apiFetch(`/status-kanban/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const deleteList = (id: string): Promise<void> => {
  return apiFetch(`/status-kanban/${id}`, { method: 'DELETE' });
};
