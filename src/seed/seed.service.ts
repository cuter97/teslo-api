import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

    constructor(
        private readonly productsService: ProductsService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async runSeed() {
        await this.deleteTable();

        const adminUser = await this.insertUser();

        await this.insertNewProducts(adminUser);

        return 'SEED EXECUTED';
    }
    
    private async deleteTable() {
        await this.productsService.deleteAllProducts();
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
        .delete()
        .where({})
        .execute()
    }
    
    private async insertUser() {
        const seedUser = initialData.users;
        const users: User[] = [];

        seedUser.forEach(user => {
            users.push(this.userRepository.create(user))
        });

        const dbUser = await this.userRepository.save(seedUser)

        return dbUser[0]
    }

    private async insertNewProducts(user: User) {
        await this.productsService.deleteAllProducts();

        const products = initialData.products;

        const insertPromises = [];

        products.forEach(prod => {
            insertPromises.push(this.productsService.create(prod, user));
        });

        await Promise.all(insertPromises);

        return true;
    }
}
