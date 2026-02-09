import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../schemas/customer.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/enums';

type CustomerSearchQuery = {
  search?: string;
  skip?: number;
  take?: number;
};

@Controller('api/customers')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async createCustomer(@Body() body: CreateCustomerDto) {
    const result = createCustomerSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.customersService.createCustomer(result.data);
  }

  @Get()
  async getCustomers(@Query() query: CustomerSearchQuery) {
    const { search, skip, take } = query;
    return this.customersService.getCustomers({
      search,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('search')
  async searchCustomers(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.customersService.searchCustomers(query);
  }

  @Get(':id')
  async getCustomer(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Put(':id')
  async updateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCustomerDto,
  ) {
    const result = updateCustomerSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.customersService.updateCustomer(id, result.data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)                                                 
  async deleteCustomer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.customersService.deleteCustomer(id);
  }
}
