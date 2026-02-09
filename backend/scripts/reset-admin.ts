import * as bcrypt from 'bcryptjs';
import { Role } from '../src/database/enums';
import { User } from '../src/database/entities';
import { getDataSource } from './typeorm-data-source';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function resetAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const ds = await getDataSource();
  const users = ds.getRepository(User);

                                    
  await users.delete({ username: adminUsername });

  console.log('Deleted existing admin user');

                      
  const hashedPassword = await hashPassword(adminPassword);

                          
  const admin = await users.save(
    users.create({
      name: adminName,
      username: adminUsername,
      password: hashedPassword,
      role: Role.ADMIN,
    }),
  );

  console.log('New admin user created successfully:', {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });

                        
  const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
  console.log('Password verification test:', isPasswordValid);
}

async function main() {
  const ds = await getDataSource();
  try {
    await resetAdminUser();
  } catch (e) {
    console.error('Error resetting admin user:', e);
    process.exit(1);
  } finally {
    await ds.destroy();
  }
}

void main(); 