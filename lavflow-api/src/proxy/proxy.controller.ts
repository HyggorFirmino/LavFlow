import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';

@Controller('proxy')
export class ProxyController {
    constructor(private readonly externalApiService: ExternalApiService) {}

    @Post('forward')
    async forwardRequest(@Body() body: { method: string; endpoint: string; storeId: string; data?: any }) {
        if (!body.method || !body.endpoint || !body.storeId) {
            throw new HttpException('Method, endpoint and storeId are required', HttpStatus.BAD_REQUEST);
        }

        try {
            const result = await this.externalApiService.dynamicRequest(body.method, body.endpoint, body.storeId, body.data);
            return result;
        } catch (error: any) {
            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data || error.message || 'Erro interno no servidor proxy';
            throw new HttpException(message, status);
        }
    }
}
