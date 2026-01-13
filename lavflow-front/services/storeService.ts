import { Store } from '../types';
import { apiFetch } from './api';

export const getStores = (): Promise<Store[]> => {
    return apiFetch<Store[]>('/stores');
};

export const getStoreById = (id: string): Promise<Store> => {
    return apiFetch<Store>(`/stores/${id}`);
};

export const createStore = (data: Partial<Store>): Promise<Store> => {
    return apiFetch<Store>('/stores', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateStore = (id: string, data: Partial<Store>): Promise<Store> => {
    return apiFetch<Store>(`/stores/${id}`, {
        method: 'PATCH', // Assumindo PATCH para update parcial, conforme controller
        body: JSON.stringify(data),
    });
};

export const deleteStore = (id: string): Promise<void> => {
    return apiFetch<void>(`/stores/${id}`, {
        method: 'DELETE',
    });
};
