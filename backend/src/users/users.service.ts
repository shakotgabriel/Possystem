                   
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '../database/enums';
import { Sale, StockAdjustment, StockCount, User } from '../database/entities';

type UserResponse = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Sale)
    private salesRepo: Repository<Sale>,
    @InjectRepository(StockAdjustment)
    private stockAdjustmentsRepo: Repository<StockAdjustment>,
    @InjectRepository(StockCount)
    private stockCountsRepo: Repository<StockCount>,
  ) {}

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private stripPassword(user: User): UserResponse {
                                                                 
    const { password: _password, ...rest } = user;
    return rest as UserResponse;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { username, password, ...rest } = createUserDto;

    const existingUser = await this.usersRepo.findOne({ where: { username } });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const created = this.usersRepo.create({
      ...rest,
      username,
      password: hashedPassword,
      role: rest.role || Role.CASHIER,
    });

    const saved = await this.usersRepo.save(created);
    return this.stripPassword(saved);
  }

  async findAll(currentUser: {
    id: string;
    role: Role;
  }): Promise<UserResponse[]> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to access this resource');
    }

    const users = await this.usersRepo.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.stripPassword(u));
  }

  async findOne(
    id: string,
    currentUser: { id: string; role: Role },
  ): Promise<UserResponse> {
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to access this resource');
    }

    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.stripPassword(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: { id: string; role: Role },
  ): Promise<UserResponse> {
    const existingUser = await this.usersRepo.findOne({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('Not authorized to update this user');
    }
    if (updateUserDto.role && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to change user role');
    }

    const data: Partial<{
      name: string;
      username: string;
      password: string;
      role: Role;
    }> = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await this.hashPassword(updateUserDto.password);
    }
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const existingUsername = await this.usersRepo.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already in use');
      }
    }

    await this.usersRepo.update({ id }, data);
    const updatedUser = await this.usersRepo.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.stripPassword(updatedUser);
  }

  async remove(
    id: string,
    currentUser: { id: string; role: Role },
  ): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser.id === id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to delete users');
    }

    const [saleCount, stockAdjustmentCount, stockCount] = await Promise.all([
      this.salesRepo.count({ where: { userId: id } }),
      this.stockAdjustmentsRepo.count({ where: { userId: id } }),
      this.stockCountsRepo.count({ where: { userId: id } }),
    ]);

    const hasRelatedRecords =
      saleCount > 0 || stockAdjustmentCount > 0 || stockCount > 0;

    if (hasRelatedRecords) {
      throw new ForbiddenException('Cannot delete user with related records');
    }

    await this.usersRepo.delete({ id });
  }

  async findByUsername(username: string) {
    this.logger.debug(`Looking up user by username: ${username}`);
    const user = await this.usersRepo.findOne({ where: { username } });

    if (user) {
      this.logger.debug(`User found: ${username}`);
    } else {
      this.logger.debug(`User not found: ${username}`);
    }

    return user;
  }

  async countUsers(): Promise<number> {
    return this.usersRepo.count();
  }
}
