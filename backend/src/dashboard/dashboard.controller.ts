import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DateRangeDto } from './dtos/date-range.dto';
import { TopProductsQueryDto } from './dtos/top-products-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/enums';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('sales')
  async getSalesByDateRange(@Query() dateRange: DateRangeDto) {
    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }
    return this.dashboardService.getSalesByDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );
  }

  @Get('top-products')
  async getTopSellingProducts(@Query() query: TopProductsQueryDto) {
    return this.dashboardService.getTopSellingProducts(query.limit);
  }
}
