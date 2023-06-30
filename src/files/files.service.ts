import { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
    getStaticImg(imgName: string) {
        const path = join(__dirname, '../../static/products', imgName);

        if(!existsSync(path)) throw new BadRequestException('No product found');

        return path;
    }
}
