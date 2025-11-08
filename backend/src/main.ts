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

  // Habilita o CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,POST',
  });

  await app.listen(3000);
}

// Correção para 'no-floating-promises':
// Adicionamos o .catch() para tratar qualquer erro fatal durante a inicialização.
bootstrap().catch((err) => {
  // Isso garante que, se o app falhar ao iniciar, o erro será logado
  // e o processo sairá com um código de falha.
  console.error('Falha ao inicializar a aplicação (bootstrap):', err);
  process.exit(1);
});
