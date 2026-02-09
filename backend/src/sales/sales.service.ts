                                                               
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto, SaleSortBy } from './dto/sale-query.dto';
import { PaymentMethod, Role, SaleStatus } from '../database/enums';
import {
  Category,
  Customer,
  Product,
  Sale,
  SaleItem,
  User,
} from '../database/entities';
import { SalesReportDto } from './dto/sales-report.dto';

@Injectable()
export class SalesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Sale)
    private salesRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepo: Repository<SaleItem>,
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: User) {
    const {
      items,
      customerId,
      totalAmount,
      paidAmount,
      change,
      paymentReference,
    } = createSaleDto;

    if (!user) {
      throw new UnauthorizedException('You must be logged in to create a sale');
    }

    if (customerId) {
      const customer = await this.customersRepo.findOne({
        where: { id: customerId },
        select: { id: true },
      });
      if (!customer) {
        throw new BadRequestException(
          `Customer with ID ${customerId} not found`,
        );
      }
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.productsRepo
      .createQueryBuilder('product')
      .select(['product.id', 'product.price', 'product.stock'])
      .where('product.id IN (:...ids)', { ids: productIds })
      .getMany();

    const productMap = new Map(products.map((p) => [p.id, p]));
    const validationErrors: string[] = [];

    for (const [, item] of items.entries()) {
      const product = productMap.get(item.productId);

      if (!product) {
        validationErrors.push(`Product with ID ${item.productId} not found`);
        continue;
      }

      if (product.price !== item.unitPrice) {
        validationErrors.push(
          `Price mismatch for product ${item.productId}. ` +
            `Expected: ${product.price}, Received: ${item.unitPrice}`,
        );
      }

      if (product.stock < item.quantity) {
        validationErrors.push(
          `Insufficient stock for product ${item.productId}. ` +
            `Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const createdSaleId = await this.dataSource.transaction(async (manager) => {
      const sale = manager.getRepository(Sale).create({
        customerId: customerId || null,
        userId: user.id,
        totalAmount,
        paidAmount,
        change,
        paymentMethod: PaymentMethod.CASH,
        paymentReference: paymentReference || null,
        status: SaleStatus.COMPLETED,
        paidAt: new Date(),
      });

      const savedSale = await manager.getRepository(Sale).save(sale);

      const saleItems = items.map((item) =>
        manager.getRepository(SaleItem).create({
          saleId: savedSale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }),
      );

      await manager.getRepository(SaleItem).save(saleItems);

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) continue;
        await manager.getRepository(Product).update(
          { id: item.productId },
          { stock: product.stock - item.quantity },
        );
      }

      return savedSale.id;
    });

    const createdSale = await this.salesRepo.findOne({
      where: { id: createdSaleId },
      relations: {
        customer: true,
        saleItems: { product: true },
      },
    });

    if (!createdSale) {
      throw new NotFoundException('Sale was created but could not be loaded');
    }

    return createdSale;
  }

  async findAll(query: SaleQueryDto, user: User) {
    if (!user) {
      throw new UnauthorizedException('You must be logged in to view sales');
    }

    const {
      customerId,
      userId,
      minTotalAmount,
      maxTotalAmount,
      minPaidAmount,
      maxPaidAmount,
      minChange,
      maxChange,
      status,
      paymentMethod,
      paymentReference,
      startDate,
      endDate,
      paidAfter,
      paidBefore,
      sortBy = SaleSortBy.CREATED_AT,
      sortDescending = false,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const allowedSortFields: Record<SaleSortBy, string> = {
      [SaleSortBy.CREATED_AT]: 'sale.createdAt',
      [SaleSortBy.UPDATED_AT]: 'sale.updatedAt',
      [SaleSortBy.TOTAL_AMOUNT]: 'sale.totalAmount',
      [SaleSortBy.PAID_AMOUNT]: 'sale.paidAmount',
      [SaleSortBy.PAID_AT]: 'sale.paidAt',
    };

    const sortField = allowedSortFields[sortBy] ?? 'sale.createdAt';
    const sortDirection = sortDescending ? 'DESC' : 'ASC';

    const qb = this.salesRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .orderBy(sortField, sortDirection)
      .skip(skip)
      .take(Number(limit));

    // Authorization / scoping
    if (user.role === 'ADMIN' && userId) {
      qb.where('sale.userId = :userId', { userId });
    } else {
      qb.where('sale.userId = :userId', { userId: user.id });
    }

    if (customerId) qb.andWhere('sale.customerId = :customerId', { customerId });
    if (status) qb.andWhere('sale.status = :status', { status });
    if (paymentMethod)
      qb.andWhere('sale.paymentMethod = :paymentMethod', { paymentMethod });
    if (paymentReference)
      qb.andWhere('LOWER(COALESCE(sale.paymentReference, \'\')) LIKE :pref', {
        pref: `%${paymentReference.toLowerCase()}%`,
      });

    if (minTotalAmount !== undefined)
      qb.andWhere('sale.totalAmount >= :minTotalAmount', { minTotalAmount });
    if (maxTotalAmount !== undefined)
      qb.andWhere('sale.totalAmount <= :maxTotalAmount', { maxTotalAmount });

    if (minPaidAmount !== undefined)
      qb.andWhere('sale.paidAmount >= :minPaidAmount', { minPaidAmount });
    if (maxPaidAmount !== undefined)
      qb.andWhere('sale.paidAmount <= :maxPaidAmount', { maxPaidAmount });

    if (minChange !== undefined)
      qb.andWhere('sale.change >= :minChange', { minChange });
    if (maxChange !== undefined)
      qb.andWhere('sale.change <= :maxChange', { maxChange });

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      qb.andWhere('sale.createdAt >= :start', { start });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('sale.createdAt <= :end', { end });
    }

    if (paidAfter) {
      const start = new Date(paidAfter);
      start.setHours(0, 0, 0, 0);
      qb.andWhere('sale.paidAt >= :paidAfterDate', { paidAfterDate: start });
    }
    if (paidBefore) {
      const end = new Date(paidBefore);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('sale.paidAt <= :paidBeforeDate', { paidBeforeDate: end });
    }

    if (query.productId) {
      qb.andWhere('saleItems.productId = :productId', {
        productId: query.productId,
      });
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const countQb = qb.clone();
    // Remove pagination for accurate total
    (countQb as any).expressionMap.skip = undefined;
    (countQb as any).expressionMap.take = undefined;
    countQb.select('sale.id').distinct(true);

    const [data, total] = await Promise.all([
      qb.getMany(),
      countQb.getCount(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findOne(id: string, user: User) {
    if (!user) {
      throw new UnauthorizedException(
        'You must be logged in to view this sale',
      );
    }

    const sale = await this.salesRepo.findOne({
      where: { id, userId: user.id },
      relations: {
        customer: true,
        saleItems: { product: true },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async remove(id: string, user: User) {
    if (!user) {
      throw new UnauthorizedException('You must be logged in to delete a sale');
    }

    try {
      const sale = await this.salesRepo.findOne({ where: { id, userId: user.id } });

      if (!sale) {
        throw new NotFoundException(
          `Sale with ID ${id} not found or access denied`,
        );
      }

      await this.salesRepo.delete({ id });

      return { message: 'Sale deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getDailySummary(date: string, user: User) {
    if (!user) {
      throw new UnauthorizedException(
        'You must be logged in to view sales summary',
      );
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysSales = await this.salesRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .where('sale.userId = :userId', { userId: user.id })
      .andWhere('sale.createdAt >= :start', { start: startOfDay })
      .andWhere('sale.createdAt <= :end', { end: endOfDay })
      .getMany();

    const count = todaysSales.length;
    const total = todaysSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const itemsSold = todaysSales.reduce(
      (acc, s) =>
        acc + (s.saleItems ?? []).reduce((a, i) => a + (i.quantity || 0), 0),
      0,
    );

    return {
      date,
      totalSales: total,
      totalTransactions: count,
      averageSale: count > 0 ? total / count : 0,
      totalItems: itemsSold,
      sales: todaysSales,
    };
  }

  async generateReport(query: SalesReportDto, user: User) {
    if (!user) {
      throw new UnauthorizedException('You must be logged in to view reports');
    }

    const { startDate, endDate, categoryId, productId } = query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const qb = this.salesRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('sale.cashier', 'cashier')
      .where('sale.createdAt >= :start', { start })
      .andWhere('sale.createdAt <= :end', { end })
      .orderBy('sale.createdAt', 'DESC');

    if (productId) qb.andWhere('saleItems.productId = :productId', { productId });
    if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });

    const sales = await qb.getMany();

    const normalizeCategoryId = (value: unknown): string | null => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const categoryIds = new Set<string>();
    for (const sale of sales) {
      for (const item of sale.saleItems ?? []) {
        const cid = normalizeCategoryId(item.product?.categoryId);
        if (cid) categoryIds.add(cid);
      }
    }

    const categories =
      categoryIds.size > 0
        ? await this.dataSource.getRepository(Category).find({
            where: { id: In(Array.from(categoryIds)) },
            select: { id: true, name: true },
          })
        : [];
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    const totalSales = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalItems = sales.reduce(
      (acc, s) =>
        acc + (s.saleItems ?? []).reduce((a, i) => a + (i.quantity || 0), 0),
      0,
    );

    const totalProfit = sales.reduce((acc, sale) => {
      const saleProfit = (sale.saleItems ?? []).reduce((itemAcc, item) => {
        const cost = (item.product?.costPrice ?? 0) * item.quantity;
        const profit = item.totalPrice - cost;
        return itemAcc + profit;
      }, 0);
      return acc + saleProfit;
    }, 0);

    const salesTrendMap = new Map<string, number>();
    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      salesTrendMap.set(day, (salesTrendMap.get(day) ?? 0) + sale.totalAmount);
    }

    const salesTrend = Array.from(salesTrendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));

    // Simple profit trend by day
    const profitTrendMap = new Map<string, number>();
    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      const profit = (sale.saleItems ?? []).reduce((acc, item) => {
        const cost = (item.product?.costPrice ?? 0) * item.quantity;
        return acc + (item.totalPrice - cost);
      }, 0);
      profitTrendMap.set(day, (profitTrendMap.get(day) ?? 0) + profit);
    }

    const profitTrend = Array.from(profitTrendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, profit]) => ({ date, profit }));

    return {
      totalSales,
      totalProfit,
      totalItems,
      sales: sales.map((sale) => ({
        id: sale.id,
        date: sale.createdAt,
        cashierId: sale.userId,
        cashierName: sale.cashier?.name ?? 'Unknown',
        customerName: sale.customer?.name || 'Unknown',
        totalAmount: sale.totalAmount,
        profit: (sale.saleItems ?? []).reduce((acc, item) => {
          const cost = (item.product?.costPrice ?? 0) * item.quantity;
          return acc + (item.totalPrice - cost);
        }, 0),
        items: (sale.saleItems ?? []).map((item) => {
          const normalizedCategoryId = normalizeCategoryId(
            item.product?.categoryId,
          );

          return {
          id: item.id,
          productName: item.product?.name ?? 'Unknown',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          profit:
            item.totalPrice - (item.product?.costPrice ?? 0) * item.quantity,
          productId: item.productId,
          categoryId: normalizedCategoryId,
          categoryName:
            item.product?.category?.name ??
            (normalizedCategoryId
              ? (categoryNameById.get(normalizedCategoryId) ?? null)
              : null),
          };
        }),
      })),
      salesTrend,
      profitTrend,
    };
  }
}
