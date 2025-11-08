import { IsString, IsNotEmpty, IsMimeType } from 'class-validator';

/**
 * DTO (Data Transfer Object) para validar o payload
 * da rota /files/upload-url
 */
export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  @IsMimeType()
  contentType: string;
}
