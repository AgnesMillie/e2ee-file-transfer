import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageModule } from 'src/storage/storage.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    StorageModule, // Importa o StorageService
    MulterModule.register({
      // Configuração do Multer (opcional, mas bom para limites)
      // Por enquanto, deixaremos o padrão (armazena em memória)
    }),
  ],
  controllers: [FilesController],
})
export class FilesModule {}
