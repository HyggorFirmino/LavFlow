const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'|| process.env.NEXT_PUBLIC_API_URL2;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
