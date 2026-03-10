// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdensModule } from './ordens/ordens.module';
import { StatusKanbanModule } from './status-kanban/status-kanban.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { ClientsModule } from './clients/clients.module';
import { LogsModule } from './logs/logs.module';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [
    // 1. Importe o ConfigModule PRIMEIRO e configure-o como global.
    // Isso garante que o ConfigService estará disponível em toda a aplicação.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Garanta que você tem um arquivo .env na raiz do projeto
    }),

    // 2. Configure o TypeOrmModule de forma assíncrona
    TypeOrmModule.forRootAsync({
      // 3. Informe ao provider que ele depende do ConfigModule (boa prática)
      imports: [ConfigModule],
      // 4. Injete o ConfigService para que ele possa ser usado na factory
      inject: [ConfigService],
      // 5. A 'useFactory' agora recebe o configService como um parâmetro válido
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL') || '';
        const isSupabase = dbUrl.includes('supabase');
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // Apenas para desenvolvimento
          ssl: isSupabase ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    // Seus outros módulos
    OrdensModule,
    StatusKanbanModule,
    TagsModule,
    UsersModule,
    StoresModule,
    ClientsModule,
    LogsModule,
  ],
  controllers: [],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class AppModule { }