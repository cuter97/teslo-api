import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

    constructor(private readonly productsService: ProductsService) { }

    async runSeed() {
        await this.insertNewProducts()
        return 'SEED EXECUTED';
    }

    private async insertNewProducts() {
        await this.productsService.deleteAllProducts();

        const products = initialData.products;

        const insertPromises = [];

        products.forEach(prod => {
            insertPromises.push(this.productsService.create(prod));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
