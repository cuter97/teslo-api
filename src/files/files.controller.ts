import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { FilesService } from './files.service';

import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
        private readonly configService: ConfigService
    ) { }

    @Get('product/:imgName')
    findImg(
        @Res() res: Response,
        @Param('imgName') imgName: string
    ) {
        const path = this.filesService.getStaticImg(imgName);

        // res.status(403).json({
        //     ok: false,
        //     path: path
        // })

        res.sendFile(path);
    }

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

        const secureUrl = `${this.configService.get('HOST_API')}/files/product${file.filename}`

        return secureUrl;
    }
}
