import { User } from '../types';
import { apiFetch } from './api';

export const createUser = (data: Partial<User>): Promise<User> => {
    return apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
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
