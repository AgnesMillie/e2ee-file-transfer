import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(S3Client) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    // Carrega o nome do bucket uma vez no construtor
    // [FIX Linter]: Quebra de linha aplicada
    this.bucketName =
      this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
  }

  /**
   * Chamado automaticamente pelo NestJS quando o módulo inicia.
   * Usamos para garantir que o bucket de armazenamento exista.
   */
  async onModuleInit() {
    this.logger.log(`Verificando bucket: ${this.bucketName}`);
    try {
      // Tenta obter os metadados do bucket para ver se ele existe
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      this.logger.log(`Bucket '${this.bucketName}' já existe.`);
    } catch (error: unknown) {
      let is404Error = false;
      // [FIX Linter]: Quebra de linha aplicada
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

  /**
   * Gera uma URL pré-assinada para UPLOAD (PUT).
   * O front-end usará esta URL para enviar o arquivo criptografado.
   * @param key O nome único do arquivo (UUID)
   * @param contentType O tipo MIME do arquivo
   * @param expiresIn Segundos até a URL expirar (padrão: 3600s = 1h)
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Gera uma URL pré-assinada para DOWNLOAD (GET).
   * @param key O nome único do arquivo (UUID)
   * @param expiresIn Segundos até a URL expirar (padrão: 3600s = 1h)
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
