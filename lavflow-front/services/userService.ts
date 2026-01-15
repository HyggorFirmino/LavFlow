import { User } from '../types';
import { apiFetch } from './api';

export const createUser = (data: Partial<User>): Promise<User> => {
    return apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
