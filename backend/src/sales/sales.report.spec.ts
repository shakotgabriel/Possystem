import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Category, Product, Sale, SaleItem, User } from '../database/entities';
import { PaymentMethod, Role, SaleStatus } from '../database/enums';

function tmpDbPath() {
  return path.join(os.tmpdir(), `pos-test-${process.pid}-${Date.now()}.sqlite`);
}

describe('Sales report (e2e-ish)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let dbPath: string;

  beforeAll(async () => {
    dbPath = tmpDbPath();
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_PATH = dbPath;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dbPath) {
      try {
        await fs.rm(dbPath, { force: true });
      } catch {
        // ignore
      }
    }
  });

  it('GET /api/sales/report returns 200 for valid dates', async () => {
    const usersRepo = dataSource.getRepository(User);
    const categoriesRepo = dataSource.getRepository(Category);
    const productsRepo = dataSource.getRepository(Product);
    const salesRepo = dataSource.getRepository(Sale);
    const saleItemsRepo = dataSource.getRepository(SaleItem);

    const password = 'admin123';
    const savedAdmin = await usersRepo.save(
      usersRepo.create({
        name: 'Admin',
        username: 'admin',
        password: await bcrypt.hash(password, 10),
        role: Role.ADMIN,
      }),
    );
    const admin = Array.isArray(savedAdmin) ? savedAdmin[0] : savedAdmin;

    const savedCategory = await categoriesRepo.save(
      categoriesRepo.create({ name: 'Beverages' } as any),
    );
    const category = Array.isArray(savedCategory)
      ? savedCategory[0]
      : savedCategory;

    const savedProduct = await productsRepo.save(
      productsRepo.create({
        name: 'Coffee',
        price: 10,
        costPrice: 6,
        stock: 100,
        minStock: 5,
        categoryId: category.id,
      }),
    );
    const product = Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;

    const savedSale = await salesRepo.save(
      salesRepo.create({
        customerId: null,
        userId: admin.id,
        totalAmount: 20,
        paidAmount: 20,
        change: 0,
        status: SaleStatus.COMPLETED,
        paymentMethod: PaymentMethod.CASH,
        paymentReference: null,
        paidAt: new Date(),
      }),
    );
    const sale = Array.isArray(savedSale) ? savedSale[0] : savedSale;

    await saleItemsRepo.save(
      saleItemsRepo.create({
        saleId: sale.id,
        productId: product.id,
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
      }),
    );

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password })
      .expect(201);

    const token = loginRes.body?.access_token;
    expect(typeof token).toBe('string');

    const startDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const endDate = new Date().toISOString();

    const res = await request(app.getHttpServer())
      .get('/api/sales/report')
      .set('Authorization', `Bearer ${token}`)
      .query({ startDate, endDate })
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        totalSales: expect.any(Number),
        totalProfit: expect.any(Number),
        totalItems: expect.any(Number),
        sales: expect.any(Array),
        salesTrend: expect.any(Array),
        profitTrend: expect.any(Array),
      }),
    );

    expect(res.body.sales[0]?.items?.[0]).toEqual(
      expect.objectContaining({
        categoryId: category.id,
        categoryName: 'Beverages',
      }),
    );
  });
});
