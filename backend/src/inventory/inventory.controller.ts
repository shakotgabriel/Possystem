import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockEntryDto } from './dtos/create-stock-entry.dto';
import { UpdateStockEntryDto } from './dtos/update-stock-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/enums';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post('entries')
  @Roles(Role.ADMIN, Role.MANAGER)
  async createStockEntry(@Body() createStockEntryDto: CreateStockEntryDto) {
    this.logger.debug(
      'Received create stock entry request:',
      createStockEntryDto,
    );
    try {
      const result =
        await this.inventoryService.createStockEntry(createStockEntryDto);
      this.logger.debug('Stock entry created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error creating stock entry:', error);
      throw error;
    }
  }

  @Get('entries')
  async getStockEntries() {
    return this.inventoryService.getStockEntries();
  }

  @Get('entries/:id')
  async getStockEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getStockEntry(id);
  }

  @Put('entries/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStockEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockEntryDto: UpdateStockEntryDto,
  ) {
    return this.inventoryService.updateStockEntry(id, updateStockEntryDto);
  }

  @Delete('entries/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  deleteStockEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.deleteStockEntry(id);
  }

  @Get('low-stock')
  async getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }
}
