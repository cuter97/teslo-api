import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger('ProductsService');//"ProductsService" clase en donde voy a usar el logger para manejar errores

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        private readonly dataSource: DataSource,
    ) { }

    async create(createProductDto: CreateProductDto) {
        try {
            const { images = [], ...productDetail } = createProductDto

            //crea la instancia (registro) del producto con sus propiedades. NO lo guarda en la base de datos
            const product = this.productRepository.create({
                ...productDetail,
                images: images.map(image => this.productImageRepository.create({ url: image }))
            });

            await this.productRepository.save(product);//lo guarda en la base de datos

            return { ...product, images };
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;
        const products = await this.productRepository.find({
            take: limit,
            skip: offset,
            relations: {
                images: true,
            }
        });
        return products.map(product => ({
            ...product,
            images: product.images.map(img => img.url)
        }))
    }

    async findOne(term: string) {
        let product: Product;
        // const product = await this.productRepository.findOneBy({ id })

        if (isUUID(term))
            product = await this.productRepository.findOneBy({ id: term });
        else {
            const queryBuilder = this.productRepository.createQueryBuilder('prod');
            product = await queryBuilder
                .where('UPPER(title)=:title or slug=:slug', {
                    title: term.toLowerCase(),
                    slug: term.toLowerCase(),
                })
                .leftJoinAndSelect('prod.images', 'prodImages')
                .getOne();
        }

        if (!product)
            throw new NotFoundException('Product not found');

        return product;
    }

    async findOnePlane(term: string) {
        const { images = [], ...res } = await this.findOne(term);
        return {
            ...res,
            images: images.map(img => img.url)
        }
    }

    async update(id: string, updateProductDto: UpdateProductDto) {

        const { images, ...toUpdate } = updateProductDto;

        //al preload le digo que busque un producto por el id y carge todas las propiedades que esten el en dto 
        const product = await this.productRepository.preload({ id, ...toUpdate });

        //create query runner
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        if (!product) throw new NotFoundException('Product not found');

        try {

            if (images) {
                //borramos las imganes anteriores
                await queryRunner.manager.delete(ProductImage, { product: { id } });

                product.images = images.map(img => this.productImageRepository.create({ url: img }))
            }

            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return this.findOnePlane(id)

        } catch (error) {

            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            this.handleDBExceptions(error);
        }
    }

    async remove(id: string) {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

    private handleDBExceptions(error: any) {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        this.logger.error(error);
        throw new InternalServerErrorException('Unexpected error, check logs');
    }

    async deleteAllProducts() {
        const query = this.productRepository.createQueryBuilder('product')

        try {
            return await query
                .delete()
                .where({})
                .execute();
        } catch (error) {
            this.handleDBExceptions(error)
        }
    }
}
