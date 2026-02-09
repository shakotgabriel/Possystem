import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/enums';

type ProductFilters = {
  categoryId?: string;
  search?: string;
  minStock?: boolean;
};

@Controller('api/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minStock') minStock?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const filters: ProductFilters = {};

    if (categoryId) filters.categoryId = categoryId;
    if (search) filters.search = search;
    if (minStock !== undefined) filters.minStock = minStock === 'true';

    return this.productsService.findAll(filters, {
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  async findLowStock(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.productsService.findLowStock({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Get('stock-levels')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  getStockLevels() {
    return this.productsService.getStockLevels();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    if (isNaN(quantity)) {
      throw new BadRequestException('Quantity must be a number');
    }
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
