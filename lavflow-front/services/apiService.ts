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
    clientId: data.client?.id, // Ensure clientId is populated from the client object
  };
  return apiFetch('/ordens', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateOrdem = (id: string, data: Partial<Card>): Promise<any> => {
  const payload = {
    ...data,
    clientId: data.client?.id,
  };
  return apiFetch(`/ordens/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
};

// Update a card status (move column)
export const mudarStatusOrdem = (ordemId: string, novoStatusId: string, idFuncionarioAcao?: string): Promise<any> => {
  return apiFetch(`/ordens/${ordemId}/mudar-status`, {
    method: 'PATCH',
    body: JSON.stringify({
      novoStatusId: Number(novoStatusId),
      idFuncionarioAcao
    }),
  });
};

export const updateOrdemStatus = (ordemId: string, novoStatusId: string): Promise<any> => {
  // Deprecated or fallback, mapping to the new specific endpoint if needed, or keeping for other uses if any.
  // Ideally we consolidate to one.
  return mudarStatusOrdem(ordemId, novoStatusId);
};

// --- Funções da API para Status (Lists) ---

export const getStatusKanban = (): Promise<any[]> => {
  return apiFetch('/status-kanban');
};

export const createList = (data: Partial<List> & { storeId: number }): Promise<any> => {
  const payload = {
    titulo: data.title,
    ordem: data.order,
    storeId: data.storeId,
    limiteCartoes: data.cardLimit,
    tipo: data.type,
    tempoSecagemTotal: data.totalDryingTime,
    intervaloLeitura: data.reminderInterval,
  };
  return apiFetch('/status-kanban', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateList = (id: string, data: Partial<List>): Promise<any> => {
  return apiFetch(`/status-kanban/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const deleteList = (id: string): Promise<void> => {
  return apiFetch(`/status-kanban/${id}`, { method: 'DELETE' });
};
