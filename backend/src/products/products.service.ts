import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category, Product } from '../database/entities';

type FindAllFilters = {
  categoryId?: string;
  search?: string;
  minStock?: boolean;
};

type PaginationOptions = {
  skip?: number;
  take?: number;
};

const DEFAULT_MIN_STOCK = 5;

@Injectable()
export class ProductsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  async findAll(
    filters: FindAllFilters = {},
    pagination: PaginationOptions = { skip: 0, take: 20 },
  ) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC')
      .skip(pagination.skip ?? 0)
      .take(pagination.take ?? 20);

    if (filters.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.search) {
      qb.andWhere('LOWER(product.name) LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }

    if (filters.minStock) {
      qb.andWhere('product.stock <= :minStock', { minStock: DEFAULT_MIN_STOCK });
      qb.andWhere('product.stock > 0');
    }

    return qb.getMany();
  }

  async findLowStock(pagination: PaginationOptions = { skip: 0, take: 20 }) {
    return this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.stock <= :minStock', { minStock: DEFAULT_MIN_STOCK })
      .andWhere('product.stock > 0')
      .orderBy('product.stock', 'ASC')
      .skip(pagination.skip ?? 0)
      .take(pagination.take ?? 20)
      .getMany();
  }

  async findOne(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const normalizedCategoryId = createProductDto.categoryId.trim();
    const category = await this.categoriesRepo.findOne({
      where: { id: normalizedCategoryId },
    });

    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    // Check if product with same name already exists
    const existingProduct = await this.productsRepo.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new BadRequestException('A product with this name already exists');
    }

    const data = {
      ...createProductDto,
      categoryId: normalizedCategoryId,
      minStock: createProductDto.minStock ?? DEFAULT_MIN_STOCK,
    };

    const created = this.productsRepo.create(data);
    const saved = await this.productsRepo.save(created);
    return this.findOne(saved.id);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.categoryId !== undefined) {
      const normalizedCategoryId = updateProductDto.categoryId.trim();
      const category = await this.categoriesRepo.findOne({
        where: { id: normalizedCategoryId },
      });

      if (!category) {
        throw new BadRequestException('Invalid category');
      }

      updateProductDto.categoryId = normalizedCategoryId;
    }

    if (updateProductDto.name) {
      const existingProduct = await this.productsRepo
        .createQueryBuilder('product')
        .where('product.name = :name', { name: updateProductDto.name })
        .andWhere('product.id != :id', { id })
        .getOne();

      if (existingProduct) {
        throw new BadRequestException(
          'A product with this name already exists',
        );
      }
    }

    await this.productsRepo.update({ id }, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    const product = await this.findOne(id);
    await this.productsRepo.delete({ id });
    return product;
  }

  async updateStock(id: string, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Product);
      const product = await repo.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const newStock = product.stock + quantity;
      if (newStock < 0) {
        throw new BadRequestException('Insufficient stock');
      }

      await repo.update({ id }, { stock: newStock });
      return this.productsRepo.findOne({
        where: { id },
        relations: { category: true },
      });
    });
  }

  async getStockLevels() {
    const [totalProducts, lowStockCount, outOfStockCount] = await Promise.all([
      this.productsRepo.count(),
      this.productsRepo
        .createQueryBuilder('product')
        .where('product.stock <= :minStock', { minStock: DEFAULT_MIN_STOCK })
        .andWhere('product.stock > 0')
        .getCount(),
      this.productsRepo.count({ where: { stock: 0 } }),
    ]);

    return {
      total: totalProducts,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      inStock: totalProducts - lowStockCount - outOfStockCount,
    };
  }
}
