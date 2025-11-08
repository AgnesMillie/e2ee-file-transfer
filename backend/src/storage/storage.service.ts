import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  // GetObjectCommand, // <-- Removido
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(S3Client) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName =
      this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
  }

  // A função onModuleInit (verificação do bucket) permanece a mesma
  async onModuleInit() {
    this.logger.log(`Verificando bucket: ${this.bucketName}`);
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      this.logger.log(`Bucket '${this.bucketName}' já existe.`);
    } catch (error: unknown) {
      let is404Error = false;
      if (error && typeof error === 'object' && '$metadata' in error) {
        const metadata = error['$metadata'] as { httpStatusCode?: number };
        if (metadata.httpStatusCode === 404) {
          is404Error = true;
        }
      }

      if (is404Error) {
        this.logger.warn(
          `Bucket '${this.bucketName}' não encontrado. Criando...`,
        );
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucketName }),
          );
          this.logger.log(`Bucket '${this.bucketName}' criado com sucesso.`);
        } catch (createError) {
          this.logger.error(
            `Falha crítica ao criar bucket '${this.bucketName}':`,
            createError,
          );
          throw createError;
        }
      } else {
        this.logger.error(
          `Erro ao verificar bucket '${this.bucketName}':`,
          error,
        );
        throw error;
      }
    }
  }

  // --- ARQUITETURA PROXY (NOVO MÉTODO) ---
  /**
   * Faz o upload de um buffer de arquivo diretamente para o Minio/S3.
   * @param fileKey A chave (nome) do arquivo.
   * @param buffer Os dados do arquivo.
   * @param contentType O tipo MIME.
   */
  // Correção Prettier: Assinatura em linha única
  async uploadFile(fileKey: string, buffer: Buffer, contentType: string) {
    this.logger.log(
      `[LOG-BACKEND-PROXY] Uploading ${fileKey} (${contentType})`,
    );

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`[LOG-BACKEND-PROXY] Sucesso no upload de ${fileKey}`);
    } catch (error) {
      this.logger.error(
        `[LOG-BACKEND-PROXY] Falha no upload de ${fileKey}`,
        error,
      );
      throw error;
    }
  }

  // Funções 'getPresigned...' removidas
}
