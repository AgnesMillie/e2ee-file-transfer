import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    // 1. Módulo de Configuração (para .env)
    // isGlobal: true torna as variáveis de ambiente disponíveis em toda a aplicação
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Garante que nosso arquivo .env seja lido
    }),

    // 2. Módulo de Banco de Dados (TypeORM)
    TypeOrmModule.forRootAsync({
      // Injeta o ConfigService para ler as variáveis de ambiente
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'db', // <- Este é o nome do serviço no docker-compose.yml
        port: 5432,
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        // Em desenvolvimento, podemos carregar entidades automaticamente
        autoLoadEntities: true,

        // ATENÇÃO: synchronize: true é ótimo para dev (cria tabelas automaticamente),
        // mas DEVE ser 'false' em produção (usaremos Migrations).
        synchronize: true,
      }),
    }),

    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
