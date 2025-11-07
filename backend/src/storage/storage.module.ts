import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // --- Início da Validação Fail-Fast ---
        const endpoint = configService.get<string>('MINIO_ENDPOINT');
        const region = configService.get<string>('MINIO_REGION');
        const accessKeyId = configService.get<string>('MINIO_ROOT_USER');
        const secretAccessKey = configService.get<string>(
          'MINIO_ROOT_PASSWORD',
        );

        if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
          throw new Error(
            'Falta configuração do S3/Minio. Verifique o arquivo .env (MINIO_ENDPOINT, MINIO_REGION, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD)',
          );
        }
        // --- Fim da Validação ---

        // Log de segurança
        console.log(
          `StorageModule: Configurando S3Client com endpoint: ${endpoint}`,
        );

        // Agora o TypeScript sabe que essas variáveis são 'string', não 'string | undefined'
        return new S3Client({
          endpoint: endpoint,
          region: region,
          forcePathStyle:
            configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
