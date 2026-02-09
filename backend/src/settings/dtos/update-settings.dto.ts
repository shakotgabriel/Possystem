import { PartialType } from '@nestjs/mapped-types';
import { BaseSettingsDto } from './base-settings.dto';

export class UpdateSettingsDto extends PartialType(BaseSettingsDto) {}
