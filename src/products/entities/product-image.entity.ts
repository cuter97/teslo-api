import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'product_images' })
export class ProductImage {
    @PrimaryGeneratedColumn() //generador unico de id
    id: number;

    @Column('text')
    url: string;

    //muchas imagenes pueden tener un producto
    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: "CASCADE" } //si el producto se elimina se borra la imagen
    )
    product: Product;
}