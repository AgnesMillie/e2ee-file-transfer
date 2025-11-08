import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import type { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Rota de Upload (Arquitetura Proxy)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async proxyUpload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }), // 1GB
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreatePresignedUrlDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const { fileKey, contentType } = body;

    // Correção Prettier: Linha única
    await this.storageService.uploadFile(fileKey, file.buffer, contentType);

    return {
      message: 'Upload concluído com sucesso.',
      fileKey: fileKey,
    };
  }

  /**
   * Rota de Download (Arquitetura Proxy)
   */
  @Get('download/:fileKey')
  async proxyDownload(
    @Param('fileKey') fileKey: string,
    @Res() res: Response, // Injeta o objeto de Resposta do Express
  ) {
    try {
      const { fileStream, contentType } =
        await this.storageService.downloadFile(fileKey);

      // Define os headers da resposta
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileKey}.encrypted"`,
      );

      // Inicia o stream do Minio (fileStream) para o cliente (res)
      fileStream.pipe(res);
    } catch {
      // Correção ESLint/SonarLint: Removemos a variável 'error' não utilizada.
      // O StorageService já logou o erro real.
      throw new NotFoundException('Arquivo não encontrado.');
    }
  }
}
