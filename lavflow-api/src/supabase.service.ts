import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabaseClient: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        // Usando as variáveis que já existem no seu .env
        const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');

        if (supabaseUrl && supabaseKey) {
            this.supabaseClient = createClient(supabaseUrl, supabaseKey);
            this.logger.log('Conexão com Supabase inicializada com sucesso!');
        } else {
            this.logger.warn('Variáveis do Supabase não encontradas no .env');
        }
    }

    // Este método permite acessar o cliente em outros arquivos
    getClient() {
        return this.supabaseClient;
    }
}
