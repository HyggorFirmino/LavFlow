import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('LavFlow API')
    .setDescription('Documentação da API LavFlow')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: [
      'http://localhost:3000',      // Teu Next.js local
      'https://empatiyalavanderia.com.br',        // Teu domínio na HostGator
    ], // Substitui pelo teu domínio da HostGator
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3001, '0.0.0.0');
}

bootstrap();
