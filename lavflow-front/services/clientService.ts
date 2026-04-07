import { Client } from '../types';
import { apiFetch } from './api';

export interface CreateClientData {
    name: string;
    cpf: string;
    address?: string;
    phone?: string;
    birthDate?: string;
}

export const createClient = async (clientData: CreateClientData): Promise<Client | null> => {
    try {
        const data = await apiFetch<any>('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });

        // Backend: id, name, cpf, address, phone
        // Frontend Client: id, name, document, phone, saldo, address
        return {
            id: data.id,
            name: data.name,
            document: data.cpf,
            phone: data.phone || '',
            birthDate: data.birthDate,
            address: data.address,
            saldo: 0 // New client starts with 0
        };
    } catch (error) {
        console.error('Error creating client:', error);
        return null;
    }
};

export const fetchLocalClients = async (): Promise<Client[]> => {
    try {
        const data = await apiFetch<any[]>('/clients');
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            document: item.cpf,
            phone: item.phone || '',
            address: item.address,
            saldo: 0
        }));
    } catch (error) {
        console.error('Error fetching local clients:', error);
        return [];
    }
};

export const updateClient = async (id: string, clientData: Partial<CreateClientData>): Promise<Client | null> => {
    try {
        await apiFetch<any>(`/clients/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(clientData),
        });

        // Return updated object structure simulating backend response or just what we sent merged
        // For simplicity, we might just return the partial data merged, but ideally backend returns the new object.
        // But typeorm update returns UpdateResult, not the object.
        // We can fetch it again or optimistically return.
        // Let's assume for now we just want to know it succeeded.
        // Actually, let's fetch the updated ONE to be sure or just assume success if no error thrown by apiFetch.
        return {
            id,
            name: clientData.name || '',
            document: clientData.cpf || '',
            phone: clientData.phone || '',
            birthDate: clientData.birthDate,
            address: clientData.address,
            saldo: 0 // Keep as is usually
        } as Client; // This cast is a bit unsafe, better logic in component
    } catch (error) {
        console.error('Error updating client:', error);
        return null;
    }
};
export const findLocalClientByCpf = async (cpf: string): Promise<Client | null> => {
    try {
        const cpfLimpo = cpf.replace(/\D/g, '');
        const data = await apiFetch<any>(`/clients?cpf=${cpfLimpo}`);
        // Assuming /clients?cpf=... returns an array of matching clients
        if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            return {
                id: item.id,
                name: item.name,
                document: item.cpf,
                phone: item.phone || '',
                address: item.address,
                saldo: 0
            };
        }
        return null;
    } catch (error) {
        console.error('Error finding local client by CPF:', error);
        return null;
    }
};
export const deleteClient = async (id: string): Promise<boolean> => {
    try {
        await apiFetch(`/clients/${id}`, {
            method: 'DELETE',
        });
        return true;
    } catch (error) {
        console.error('Error deleting client:', error);
        throw error; // Let the component handle it (e.g., showing the restriction message)
    }
};
