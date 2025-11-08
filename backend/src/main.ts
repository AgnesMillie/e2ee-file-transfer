import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilita o CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: '*', // Em produção, travaríamos para a URL do front-end
    methods: 'GET,POST,OPTIONS', // <-- CORREÇÃO: Adiciona OPTIONS
  });

  await app.listen(3000);
}

// Correção para 'no-floating-promises':
bootstrap().catch((err) => {
  console.error('Falha ao inicializar a aplicação (bootstrap):', err);
  process.exit(1);
});
