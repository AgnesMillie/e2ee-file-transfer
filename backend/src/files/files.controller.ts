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
} from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Removemos a rota antiga 'upload-url'.
   * Ela será substituída pela nova rota 'upload' abaixo.
   */

  /**
   * --- ARQUITETURA PROXY (NOVA ROTA) ---
   * Aceita um upload de arquivo (multipart/form-data)
   * O front-end enviará 'fileKey', 'contentType' e o 'file' (blob)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Diz ao NestJS para procurar um campo 'file'
  @HttpCode(HttpStatus.OK)
  async proxyUpload(
    @UploadedFile(
      // Validação de Segurança (Pipe)
      new ParseFilePipe({
        validators: [
          // Limite de 1GB (em bytes)
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File, // O arquivo extraído pelo Multer
    @Body() body: CreatePresignedUrlDto, // O resto dos campos (fileKey, contentType)
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    // O 'body' contém o DTO (fileKey, contentType)
    // O 'file' contém o 'buffer' (os dados criptografados)

    // Usamos o contentType do DTO, pois o 'file.mimetype'
    // (do blob criptografado) será 'application/octet-stream'
    const { fileKey, contentType } = body;

    await this.storageService.uploadFile(
      fileKey,
      file.buffer, // O buffer de dados
      contentType, // O tipo original (do DTwo)
    );

    return {
      message: 'Upload concluído com sucesso.',
      fileKey: fileKey,
    };
  }
}
