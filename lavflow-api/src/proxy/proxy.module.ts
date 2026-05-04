import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ExternalApiService } from './external-api.service';
import { SupabaseService } from '../supabase.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [ProxyController],
  providers: [ExternalApiService, SupabaseService],
  exports: [ExternalApiService],
})
export class ProxyModule {}
