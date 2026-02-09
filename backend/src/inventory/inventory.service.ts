import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStockEntryDto } from './dtos/create-stock-entry.dto';
import { UpdateStockEntryDto } from './dtos/update-stock-entry.dto';
import { Product, StockEntry } from '../database/entities';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(StockEntry)
    private stockEntriesRepo: Repository<StockEntry>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
  ) {}

  async createStockEntry(createStockEntryDto: CreateStockEntryDto) {
    this.logger.debug('Creating stock entry with data:', createStockEntryDto);
    try {
      const created = this.stockEntriesRepo.create({
        quantity: createStockEntryDto.quantity,
      });
      const result = await this.stockEntriesRepo.save(created);
      this.logger.debug('Stock entry created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error creating stock entry:', error);
      throw error;
    }
  }

  async getStockEntries() {
    return this.stockEntriesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getStockEntry(id: string) {
    const entry = await this.stockEntriesRepo.findOne({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Stock entry not found');
    }

    return entry;
  }

  async updateStockEntry(id: string, updateStockEntryDto: UpdateStockEntryDto) {
    const entry = await this.stockEntriesRepo.findOne({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Stock entry not found');
    }

    await this.stockEntriesRepo.update({ id }, updateStockEntryDto);
    return this.getStockEntry(id);
  }

  async deleteStockEntry(id: string) {
    const entry = await this.stockEntriesRepo.findOne({ where: { id } });

    if (!entry) {
      throw new NotFoundException('Stock entry not found');
    }

    await this.stockEntriesRepo.delete({ id });
    return entry;
  }

  async getLowStockProducts() {
    const products = await this.productsRepo.find({
      relations: { category: true },
    });
    return products.filter((product) => product.stock <= product.minStock);
  }
}
