import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // --- INÍCIO DA CONFIGURAÇÃO DO SWAGGER ---

  // 1. Crie uma instância do DocumentBuilder para configurar a documentação
  const config = new DocumentBuilder()
    .setTitle('LavFlow API') // Use o nome do seu projeto
    .setDescription('Documentação da API para o sistema de gestão de lavanderia')
    .setVersion('1.0')
    .addTag('ordens', 'Operações relacionadas a ordens de serviço') // Adiciona uma "tag" para agrupar endpoints
    .addTag('funcionarios', 'Operações relacionadas a funcionários')
    .addTag('Status (Kanban)', 'Gerenciamento das colunas do quadro Kanban') 
    .build();

  // 2. Crie o documento OpenAPI completo
  const document = SwaggerModule.createDocument(app, config);

  // 3. Configure o endpoint da UI do Swagger
  // O primeiro argumento 'api' define a rota. Ex: http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  // --- FIM DA CONFIGURAÇÃO DO SWAGGER ---

  await app.listen(3001);
}
bootstrap();