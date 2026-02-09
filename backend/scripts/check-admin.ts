import * as bcrypt from 'bcryptjs';
import { User } from '../src/database/entities';
import { getDataSource } from './typeorm-data-source';

async function checkAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const ds = await getDataSource();
  const users = ds.getRepository(User);
  try {
    const admin = await users.findOne({ where: { username: adminUsername } });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user details:', {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      hasPassword: !!admin.password,
      passwordLength: admin.password.length,
    });

                               
    const testPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password comparison result:', isMatch);

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await ds.destroy();
  }
}

void checkAdminUser(); 