import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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

  async uploadFile(fileKey: string, buffer: Buffer, contentType: string) {
    // [LOG-BACKEND-PROXY] Removido

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      // [LOG-BACKEND-PROXY] Removido
    } catch (error) {
      this.logger.error(
        `[LOG-BACKEND-PROXY] Falha no upload de ${fileKey}`,
        error,
      );
      throw error;
    }
  }

  async downloadFile(
    fileKey: string,
  ): Promise<{ fileStream: NodeJS.ReadableStream; contentType: string }> {
    // [LOG-BACKEND-PROXY] Removido
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      const response = await this.s3Client.send(command);
      return {
        fileStream: response.Body as NodeJS.ReadableStream,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      this.logger.error(
        `[LOG-BACKEND-PROXY] Falha ao baixar ${fileKey}`,
        error,
      );
      throw error;
    }
  }
}
