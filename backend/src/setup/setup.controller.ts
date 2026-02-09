import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { InitializeSetupDto } from './dtos/initialize-setup.dto';

@ApiTags('setup')
@Controller('setup')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check whether initial setup is completed' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns initialization status',
  })
  getStatus() {
    return this.setupService.getStatus();
  }

  @Post('initialize')
  @ApiOperation({ summary: 'One-time initialization (first admin + settings)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Setup completed',
  })
  initialize(@Body() dto: InitializeSetupDto) {
    return this.setupService.initialize(dto);
  }
}
