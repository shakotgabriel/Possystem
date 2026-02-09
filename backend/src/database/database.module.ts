import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const dbType = (config.get<string>('DB_TYPE') ?? 'sqljs').toLowerCase();
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (dbType === 'postgres') {
          if (!databaseUrl) {
            throw new Error('DB_TYPE=postgres requires DATABASE_URL');
          }
                                     
          return {
            type: 'postgres' as const,
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
            logging: config.get<string>('TYPEORM_LOGGING') === 'true',
            ssl: {
              rejectUnauthorized: false,
            },
          };
        } else {
                                            
          const fs = await import('node:fs/promises');
          const path = await import('node:path');
          
          const dbPath =
            config.get<string>('DB_PATH') ??
            path.join(process.cwd(), 'data', 'pos.sqlite');

          await fs.mkdir(path.dirname(dbPath), { recursive: true });

          return {
            type: 'sqljs' as const,
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
            logging: config.get<string>('TYPEORM_LOGGING') === 'true',
          };
        }
      },
    }),
  ],
})
export class DatabaseModule {}
