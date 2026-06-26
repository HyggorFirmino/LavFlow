import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar o limite para suportar uploads de áudio em base64
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('LavFlow API')
    .setDescription('Documentação da API LavFlow')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: true, // Permite qualquer origem dinamicamente (necessário para testes em múltiplos dispositivos locais)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3001, '0.0.0.0');
}

bootstrap();
