import { Card, List } from '../types';
import { apiFetch } from './api';

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
