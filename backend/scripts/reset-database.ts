import 'reflect-metadata';

import { config } from 'dotenv';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getDataSource } from './typeorm-data-source';

config();

async function resetDatabase() {
  const dbType = (process.env.DB_TYPE ?? 'sqljs').toLowerCase();

                                                                    
  if (dbType !== 'postgres') {
    const dbPath =
      process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'pos.sqlite');
    try {
      await fs.mkdir(path.dirname(dbPath), { recursive: true });
      await fs.rm(dbPath, { force: true });
      console.log(`Deleted local DB file: ${dbPath}`);
    } catch {
      // ignore
    }
  }

  const ds = await getDataSource();

  try {
    console.log('Starting database reset...');
    if (dbType === 'postgres') {
      console.log('Dropping existing tables...');
      await ds.dropDatabase();
    }

    await ds.synchronize();

    console.log('Database structure recreated');

    console.log('\nDatabase reset completed successfully.');
    console.log('Database is empty. Complete initial setup in the UI at /setup to create the first admin and initialize settings.');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await ds.destroy();
  }
}

void resetDatabase();
