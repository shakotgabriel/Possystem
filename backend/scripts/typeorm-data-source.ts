import 'reflect-metadata';

import { config } from 'dotenv';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DataSource } from 'typeorm';

import {
  Category,
  Customer,
  Product,
  Sale,
  SaleItem,
  Settings,
  StockAdjustment,
  StockCount,
  StockEntry,
  User,
} from '../src/database/entities';

config();

let cached: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (cached?.isInitialized) return cached;

  const dbType = (process.env.DB_TYPE ?? 'sqljs').toLowerCase();
  const databaseUrl = process.env.DATABASE_URL;

  if (dbType === 'postgres') {
    if (!databaseUrl) {
      throw new Error('DB_TYPE=postgres requires DATABASE_URL');
    }
                               
    cached = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [
        User,
        Settings,
        Customer,
        Category,
        Product,
        Sale,
        SaleItem,
        StockEntry,
        StockAdjustment,
        StockCount,
      ],
      synchronize: true,
      logging: process.env.TYPEORM_LOGGING === 'true',
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } else {
                                      
    const dbPath =
      process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'pos.sqlite');

    await fs.mkdir(path.dirname(dbPath), { recursive: true });

    cached = new DataSource({
      type: 'sqljs',
      location: dbPath,
      autoSave: true,
      entities: [
        User,
        Settings,
        Customer,
        Category,
        Product,
        Sale,
        SaleItem,
        StockEntry,
        StockAdjustment,
        StockCount,
      ],
      synchronize: true,
      logging: process.env.TYPEORM_LOGGING === 'true',
    });
  }

  await cached.initialize();
  return cached;
}
