                        
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category, Product } from '../database/entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepo.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    const created = this.categoriesRepo.create(createCategoryDto);
    return this.categoriesRepo.save(created);
  }

  async findAll() {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    this.validateId(id);
    const category = await this.categoriesRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.validateId(id);

    await this.findOne(id);

    if (updateCategoryDto.name) {
      const existingCategory = await this.categoriesRepo
        .createQueryBuilder('category')
        .where('category.name = :name', { name: updateCategoryDto.name })
        .andWhere('category.id != :id', { id })
        .getOne();

      if (existingCategory) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    await this.categoriesRepo.update({ id }, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    this.validateId(id);

    await this.findOne(id);

    const productsCount = await this.productsRepo.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated products',
      );
    }

    const category = await this.findOne(id);
    await this.categoriesRepo.delete({ id });
    return category;
  }

  private validateId(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid category ID');
    }
  }
}
