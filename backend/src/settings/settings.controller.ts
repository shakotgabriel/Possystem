import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Param,
  ParseFloatPipe,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Settings } from '../database/entities';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current settings',
    type: Settings,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Post('initialize/:initialRate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Initialize application settings' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Settings initialized successfully',
    type: Settings,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Settings already initialized or invalid rate',
  })
  async initializeSettings(
    @Param('initialRate', ParseFloatPipe) initialRate: number,
  ): Promise<Settings> {
    try {
      return await this.settingsService.initializeSettings(initialRate);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Settings updated successfully',
    type: Settings,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    try {
      return await this.settingsService.updateSettings(updateSettingsDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('exchange-rate/:newRate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update exchange rate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exchange rate updated successfully',
    type: Settings,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid rate' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  async updateExchangeRate(
    @Param('newRate', ParseFloatPipe) newRate: number,
  ): Promise<Settings> {
    try {
      return await this.settingsService.updateExchangeRate(newRate);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('backup')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get backup settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns backup settings',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  async getBackupSettings() {
    try {
      return await this.settingsService.getBackupSettings();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
