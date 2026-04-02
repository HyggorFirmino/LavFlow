import { Card, List } from '../types';
import { apiFetch } from './api';

// --- Funções da API para Ordens (Cards) ---

export const getOrdens = (): Promise<any[]> => {
  // Add timestamp to prevent aggressive browser caching
  return apiFetch(`/ordens?_t=${Date.now()}`);
};

export const createOrdem = (data: Partial<Card> & { storeId?: number }): Promise<any> => {
  // Construir payload limpo apenas com campos do CreateOrdemDto
  const payload: Record<string, any> = {
    clientId: data.client?.id,
    notes: data.notes,
    tags: data.tags,
    basketIdentifier: data.basketIdentifier,
    numeroCesto: data.numeroCesto,
    serviceValue: data.serviceValue,
    paymentMethod: data.paymentMethod,
    services: data.services,
    storeId: data.storeId ? Number(data.storeId) : undefined,
  };

  // Só enviar idStatusInicial se tiver listId explícito
  if (data.listId) {
    payload.idStatusInicial = Number(data.listId);
  }

  // Remover campos undefined do payload
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key];
  });

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
  const payload: any = {};
  if (data.title !== undefined) payload.titulo = data.title;
  if (data.cardLimit !== undefined) payload.limiteCartoes = data.cardLimit;
  if (data.type !== undefined) payload.tipo = data.type;
  if (data.totalDryingTime !== undefined) payload.tempoSecagemTotal = data.totalDryingTime;
  if (data.reminderInterval !== undefined) payload.intervaloLeitura = data.reminderInterval;

  return apiFetch(`/status-kanban/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
};

export const deleteList = (id: string): Promise<void> => {
  return apiFetch(`/status-kanban/${id}`, { method: 'DELETE' });
};

export const reorderStatusOrdem = (storeId: number, orderedIds: number[]): Promise<void> => {
  return apiFetch('/status-kanban/reorder', {
    method: 'POST',
    body: JSON.stringify({ storeId, orderedIds })
  });
};

// --- Funções da API para Etiquetas (Tags) ---

export const getTags = (storeId?: number | string): Promise<any[]> => {
  const query = storeId ? `?storeId=${storeId}` : '';
  return apiFetch(`/tags${query}`);
};

export const createTag = (data: any): Promise<any> => {
  return apiFetch('/tags', { method: 'POST', body: JSON.stringify(data) });
};

export const updateTag = (id: number, data: any): Promise<any> => {
  return apiFetch(`/tags/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const deleteTag = (id: number): Promise<void> => {
  return apiFetch(`/tags/${id}`, { method: 'DELETE' });
};
