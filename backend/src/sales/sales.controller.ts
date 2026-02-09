import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto, SaleSortBy } from './dto/sale-query.dto';
import {
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../database/entities';

                                                                 
import { SalesFindAllResponseDto } from './dto/sales-response.dto';
import { SalesReportDto } from './dto/sales-report.dto';

@ApiTags('sales')
@Controller('api/sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized - Login required' })
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Req() req: Request & { user: User },
  ) {
    return this.salesService.create(createSaleDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated sales data' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID who created the sale',
  })
  @ApiQuery({
    name: 'minTotalAmount',
    required: false,
    type: Number,
    description: 'Filter by minimum total amount',
  })
  @ApiQuery({
    name: 'maxTotalAmount',
    required: false,
    type: Number,
    description: 'Filter by maximum total amount',
  })
  @ApiQuery({
    name: 'minPaidAmount',
    required: false,
    type: Number,
    description: 'Filter by minimum paid amount',
  })
  @ApiQuery({
    name: 'maxPaidAmount',
    required: false,
    type: Number,
    description: 'Filter by maximum paid amount',
  })
  @ApiQuery({
    name: 'minChange',
    required: false,
    type: Number,
    description: 'Filter by minimum change',
  })
  @ApiQuery({
    name: 'maxChange',
    required: false,
    type: Number,
    description: 'Filter by maximum change',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
    description: 'Filter by sale status',
  })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'],
    description: 'Filter by payment method',
  })
  @ApiQuery({
    name: 'paymentReference',
    required: false,
    description: 'Search by payment reference (case-insensitive)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by creation date (ISO date string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by creation end date (ISO date string)',
  })
  @ApiQuery({
    name: 'paidAfter',
    required: false,
    description: 'Filter by payment date (ISO date string)',
  })
  @ApiQuery({
    name: 'paidBefore',
    required: false,
    description: 'Filter by payment end date (ISO date string)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: SaleSortBy,
    description: 'Field to sort by',
    example: SaleSortBy.CREATED_AT,
  })
  @ApiQuery({
    name: 'sortDescending',
    required: false,
    type: Boolean,
    description: 'Sort in descending order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findAll(
    @Query() query: SaleQueryDto,
    @Req() req: Request & { user: User },
  ): Promise<SalesFindAllResponseDto> {
    console.log('Received sales query params:', query);
    const result = await this.salesService.findAll(query, req.user);

                                                                        
    const data = result.data;
    const pagination = result.pagination;

    return {
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        pageSize: pagination.limit,                                             
        totalPages: pagination.totalPages,
      },
      totalSales: pagination.total,                                          
      totalItems: pagination.total,                                          
    };
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({ status: 200, description: 'Returns daily summary' })
  getDailySummary(
    @Query('date') date: string,
    @Req() req: Request & { user: User },
  ) {
    return this.salesService.getDailySummary(date, req.user);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get sales report with analytics' })
  @ApiResponse({ status: 200, description: 'Returns sales report data' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for the report (ISO date string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for the report (ISO date string)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Filter by product ID',
  })
  async getSalesReport(
    @Query() query: SalesReportDto,
    @Req() req: Request & { user: User },
  ) {
    return this.salesService.generateReport(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 200, description: 'Returns the sale' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.salesService.findOne(id, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 200, description: 'Sale deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.salesService.remove(id, req.user);
  }
}
