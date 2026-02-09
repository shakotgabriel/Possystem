import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Sale, SaleItem, Customer } from '../database/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private salesRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepo: Repository<SaleItem>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,
  ) {}

  async getDashboardStats() {
    const [
      totalSales,
      totalRevenue,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      this.getTotalSales(),
      this.getTotalRevenue(),
      this.getTotalCustomers(),
      this.getTotalProducts(),
      this.getLowStockProducts(),
    ]);

    return {
      totalSales,
      totalRevenue,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    };
  }

  async getSalesByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.salesRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .where('sale.createdAt >= :start', { start })
      .andWhere('sale.createdAt <= :end', { end })
      .orderBy('sale.createdAt', 'DESC')
      .getMany();
  }

  async getTopSellingProducts(limit: number = 5) {
    const rows = await this.saleItemsRepo
      .createQueryBuilder('saleItem')
      .select('saleItem.productId', 'productId')
      .addSelect('SUM(saleItem.quantity)', 'qty')
      .groupBy('saleItem.productId')
      .orderBy('qty', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string; qty: string }>();

    const productIds = rows.map((r) => r.productId);
    if (productIds.length === 0) return [];

    const products = await this.productsRepo.find({
      where: productIds.map((id) => ({ id })),
      relations: { category: true, saleItems: true },
    });

    const qtyMap = new Map(rows.map((r) => [r.productId, Number(r.qty)]));
    return products
      .map((p) => ({ ...p, totalSold: qtyMap.get(p.id) ?? 0 }))
      .sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0))
      .slice(0, limit);
  }

  private async getTotalSales() {
    return this.salesRepo.count();
  }

  private async getTotalRevenue() {
    const rows = await this.salesRepo
      .createQueryBuilder('sale')
      .select('SUM(sale.totalAmount)', 'sum')
      .getRawOne<{ sum: string | null }>();
    return Number(rows?.sum ?? 0);
  }

  private async getTotalCustomers() {
    return this.customersRepo.count();
  }

  private async getTotalProducts() {
    return this.productsRepo.count();
  }

  private async getLowStockProducts() {
    return this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.stock < :min', { min: 5 })
      .getMany();
  }
}
