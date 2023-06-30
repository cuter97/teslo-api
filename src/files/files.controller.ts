import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('product')
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: fileFilter,
        // limits: { fieldSize: 1000 }
        storage: diskStorage({
            destination: './static/products',
            filename: fileNamer
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {

        if (!file) { throw new BadRequestException() }

        return file;
    }
}
