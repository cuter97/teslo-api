import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('product')
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: fileFilter
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {

        if (!file) { throw new BadRequestException() }

        return file;
    }
}
