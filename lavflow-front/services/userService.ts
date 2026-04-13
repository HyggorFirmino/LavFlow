import { User } from '../types';
import { apiFetch } from './api';

export const getUsers = (): Promise<User[]> => {
    return apiFetch<User[]>('/users');
};

export const getUserById = (id: string): Promise<User> => {
    return apiFetch<User>(`/users/${id}`);
};

export const createUser = (data: Partial<User> & { storeIds?: number[] }): Promise<User> => {
    return apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateUser = (id: string, data: Partial<User> & { storeIds?: number[] }): Promise<User> => {
    return apiFetch<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deleteUser = (id: string): Promise<void> => {
    return apiFetch<void>(`/users/${id}`, {
        method: 'DELETE',
    });
};

export const login = async (data: { email: string; password: string; }): Promise<User> => {
    const user = await apiFetch<any>('/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    // Map backend response to Frontend User type
    return {
        ...user,
        id: String(user.id),
        theme: user.theme || 'claro',
    };
};
