import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SupabaseService } from '../supabase.service';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class ExternalApiService {
    private readonly logger = new Logger(ExternalApiService.name);
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

    constructor(
        private configService: ConfigService,
        private supabaseService: SupabaseService,
        private storesService: StoresService,
    ) {
        const baseURL = this.configService.get<string>('EXTERNAL_API_BASE_URL') || 'https://api-dashboard.maxpan.com.br/v1/';
        
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const storeId = originalRequest.headers['X-Store-Id'] || originalRequest.headers['x-store-id'];

                // Check if error is 401 and request has not been retried yet
                if (error.response?.status === 401 && !originalRequest._retry && storeId) {
                    if (this.isRefreshing) {
                        // If a refresh is already in progress, queue the request
                        try {
                            await new Promise((resolve, reject) => {
                                this.failedQueue.push({ resolve, reject });
                            });
                            // After refresh completes, resolve the promise and retry the original request
                            originalRequest.headers['Authorization'] = `Bearer ${await this.getAccessToken(storeId)}`;
                            return this.axiosInstance(originalRequest);
                        } catch (err) {
                            return Promise.reject(err);
                        }
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newAccessToken = await this.refreshTokens(storeId);
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        this.processQueue(null);
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError);
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private processQueue(error: any) {
        this.failedQueue.forEach((promise) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve();
            }
        });
        this.failedQueue = [];
    }

    private async getStore(storeId: string) {
        if (!storeId) return null;
        if (!isNaN(Number(storeId))) {
            return await this.storesService.findOne(Number(storeId)).catch(() => null);
        } else {
            return await this.storesService.findByMaxpanId(storeId);
        }
    }

    private async getAccessToken(storeId: string): Promise<string> {
        const store = await this.getStore(storeId);
        return store?.BearerTokenMaxpan || '';
    }

    private async getRefreshToken(storeId: string): Promise<string> {
        const store = await this.getStore(storeId);
        return store?.refreshTokenMaxpan || '';
    }

    private async saveTokens(storeId: string, accessToken: string, refreshToken: string): Promise<void> {
        const store = await this.getStore(storeId);
        if (!store) return;
        await this.storesService.update(store.id, {
            BearerTokenMaxpan: accessToken,
            refreshTokenMaxpan: refreshToken,
        });
        this.logger.log(`Tokens atualizados no banco para a loja ${storeId} (ID Interno: ${store.id}).`);
    }

    private async refreshTokens(storeId: string): Promise<string> {
        this.logger.log(`Iniciando refresh do token para a loja ${storeId}...`);
        try {
            const refreshToken = await this.getRefreshToken(storeId);
            if (!refreshToken) throw new Error('Refresh token não encontrado para esta loja');

            const refreshEndpoint = this.configService.get<string>('EXTERNAL_API_REFRESH_ENDPOINT') || 'auth/refresh-tokens';
            const baseURL = this.configService.get<string>('EXTERNAL_API_BASE_URL') || 'https://api-dashboard.maxpan.com.br/v1/';
            
            // Real API call to refresh token
            const response = await axios.post(`${baseURL}${refreshEndpoint}`, {
                refreshToken: refreshToken
            });
            const data = response.data;
            
            const access_token = data?.access?.token || data?.accessToken || data?.token;
            const new_refresh_token = data?.refresh?.token || data?.refreshToken || data?.refresh_token;

            if (access_token && new_refresh_token) {
                await this.saveTokens(storeId, access_token, new_refresh_token);
                this.logger.log(`Token atualizado com sucesso para a loja ${storeId}.`);
                return access_token;
            } else {
                throw new Error('Formato de resposta de refresh desconhecido.');
            }

        } catch (error) {
            this.logger.error(`Erro ao fazer refresh do token para loja ${storeId}`, error);
            throw error;
        }
    }

    public async dynamicRequest(method: string, endpoint: string, storeId: string, data?: any): Promise<any> {
        const accessToken = await this.getAccessToken(storeId);

        if (!accessToken) {
            this.logger.warn(`Tentativa de requisição sem token para loja ${storeId}`);
        }

        try {
            const response = await this.axiosInstance({
                method,
                url: endpoint,
                data,
                headers: {
                    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
                    'X-Store-Id': storeId,
                },
            });
            return response.data;
        } catch (error: any) {
            this.logger.error(`Erro na requisição externa (${method} ${endpoint}): ${error.message}`);
            // Rethrow the error to be handled by the controller and passed to the frontend
            throw error;
        }
    }
}
