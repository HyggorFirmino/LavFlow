// services/proxyService.ts
import { API_URL } from './api'; 

export const chamarApiExterna = async (method: string, endpoint: string, storeId: string, data?: any) => {
    try {
        const response = await fetch(`${API_URL}/proxy/forward`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method,
                endpoint,
                storeId,
                data,
            }),
        });

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};

        if (!response.ok) {
            // Forward the error with the correct status code and the original data from Maxpan
            throw { status: response.status, message: result.message || result.error || 'Erro na chamada via proxy', data: result };
        }

        return result;
    } catch (error) {
        console.error('Erro na chamada da API externa via proxy:', error);
        throw error;
    }
};

export const forceRefreshToken = async (storeId: string) => {
    try {
        const response = await fetch(`${API_URL}/proxy/force-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ storeId }),
        });

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw { status: response.status, message: result.message || result.error || 'Erro ao atualizar token', data: result };
        }

        return result;
    } catch (error) {
        console.error('Erro ao forçar atualização do token:', error);
        throw error;
    }
};
