import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger('ProductsService')//"ProductsService" clase en donde voy a usar el logger para manejar errores

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto) {
        try {
            const product = this.productRepository.create(createProductDto); //crea la instancia (registro) del producto con sus propiedades. NO lo guarda en la base de datos
            await this.productRepository.save(product)//lo guarda en la base de datos
            return product
        } catch (error) {
            this.handleDBExceptions(error)
        }
    }

    findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto
        return this.productRepository.find({
            take: limit,
            skip: offset,
        })
    }

    async findOne(term: string) {
        let product: Product;
        // const product = await this.productRepository.findOneBy({ id })

        if (isUUID(term))
            product = await this.productRepository.findOneBy({ id: term })
        else {
            const queryBuilder = this.productRepository.createQueryBuilder();
            product = await queryBuilder
                .where('UPPER(title)=:title or slug=:slug', {
                    title: term.toLowerCase(),
                    slug: term.toLowerCase(),
                }).getOne(); 
        }

        if (!product)
            throw new NotFoundException('Product not found');
        return product;
    }

    update(id: number, updateProductDto: UpdateProductDto) {
        return `This action updates a #${id} product`;
    }

    async remove(id: string) {
        const product = await this.findOne(id)
        await this.productRepository.remove(product)
    }

    private handleDBExceptions(error: any) {
        if (error.code === '23505')
            throw new BadRequestException(error.detail)

        this.logger.error(error)
        throw new InternalServerErrorException('Unexpected error, check logs')
    }

}
