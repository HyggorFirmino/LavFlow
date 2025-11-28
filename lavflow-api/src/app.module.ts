// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdensModule } from './ordens/ordens.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { StatusKanbanModule } from './status-kanban/status-kanban.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';

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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'), // Esta é a linha que provavelmente estava dando o erro
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Apenas para desenvolvimento
      }),
    }),

    // Seus outros módulos
    OrdensModule,
    FuncionariosModule,
    StatusKanbanModule,
    TagsModule,
    UsersModule,
    StoresModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}