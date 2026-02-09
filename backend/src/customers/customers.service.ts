import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { validate as isUUID } from 'uuid';
import { Customer, Sale } from '../database/entities';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,
    @InjectRepository(Sale)
    private salesRepo: Repository<Sale>,
  ) {}

  private validateId(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid customer ID');
    }
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    if (createCustomerDto.phone) {
      const existingCustomer = await this.customersRepo.findOne({
        where: { phone: createCustomerDto.phone },
      });

      if (existingCustomer) {
        throw new ConflictException(
          'Customer with this phone number already exists',
        );
      }
    }

    const created = this.customersRepo.create(createCustomerDto);
    return this.customersRepo.save(created);
  }

  async getCustomers(
    params: {
      skip?: number;
      take?: number;
      search?: string;
    } = {},
  ): Promise<Customer[]> {
    const { skip, take, search } = params;

    const qb = this.customersRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sale')
      .orderBy('customer.name', 'ASC');

    if (search) {
      const searchLike = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(customer.name) LIKE :search OR LOWER(COALESCE(customer.phone, \'\')) LIKE :search)',
        { search: searchLike },
      );
    }

    if (skip !== undefined) qb.skip(skip);
    if (take !== undefined) qb.take(take);

    return qb.getMany();
  }

  async getCustomerById(id: string): Promise<Customer> {
    this.validateId(id);

    const customer = await this.customersRepo.findOne({
      where: { id },
      relations: { sales: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.getCustomerById(id);

    if (updateCustomerDto.phone) {
      const existingCustomer = await this.customersRepo
        .createQueryBuilder('customer')
        .where('customer.phone = :phone', { phone: updateCustomerDto.phone })
        .andWhere('customer.id != :id', { id })
        .getOne();

      if (existingCustomer) {
        throw new ConflictException(
          'Another customer with this phone number already exists',
        );
      }
    }

    await this.customersRepo.update({ id }, updateCustomerDto);
    return this.getCustomerById(id);
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const customer = await this.getCustomerById(id);

    const salesCount = await this.salesRepo.count({ where: { customerId: id } });
    if (salesCount > 0) {
      throw new ConflictException('Cannot delete customer with existing sales');
    }

    await this.customersRepo.delete({ id });

    return { message: 'Customer deleted successfully' };
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const searchLike = `%${query.toLowerCase()}%`;
    return this.customersRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sale')
      .where(
        '(LOWER(customer.name) LIKE :search OR LOWER(COALESCE(customer.phone, \'\')) LIKE :search)',
        { search: searchLike },
      )
      .take(10)
      .getMany();
  }
}
