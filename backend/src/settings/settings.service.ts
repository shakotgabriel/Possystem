import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../database/entities';
import { CreateSettingsDto } from './dtos/create-settings.dto';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
  ) {}

  private async findFirstSettings(): Promise<Settings | null> {
    const settingsList = await this.settingsRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    return settingsList[0] ?? null;
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.findFirstSettings();

    if (!settings) {
      throw new NotFoundException(
        'Settings not found. Please initialize settings first.',
      );
    }

    return settings;
  }

  async isInitialized(): Promise<boolean> {
    const settings = await this.findFirstSettings();
    return Boolean(settings);
  }

  async initializeSettings(initialRate: number): Promise<Settings> {
    const existingSettings = await this.findFirstSettings();
    if (existingSettings) {
      throw new BadRequestException('Settings already initialized');
    }

    const createDto = new CreateSettingsDto(initialRate);

    const created = this.settingsRepo.create({
      ...createDto,
      lastRateUpdate: new Date(),
    });

    return this.settingsRepo.save(created);
  }

  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    const existingSettings = await this.findFirstSettings();

    if (!existingSettings) {
      throw new NotFoundException(
        'Settings not found. Please initialize settings first.',
      );
    }

    if (updateSettingsDto.usdToSsdRate) {
      updateSettingsDto.lastRateUpdate = new Date();
    }

    await this.settingsRepo.update(
      { id: existingSettings.id },
      {
        ...updateSettingsDto,
        updatedAt: new Date(),
      },
    );

    const updated = await this.settingsRepo.findOne({
      where: { id: existingSettings.id },
    });
    if (!updated) {
      throw new NotFoundException('Settings not found');
    }
    return updated;
  }

  async updateExchangeRate(newRate: number): Promise<Settings> {
    if (!newRate || newRate <= 0) {
      throw new BadRequestException('Exchange rate must be greater than 0');
    }

    const existingSettings = await this.findFirstSettings();

    if (!existingSettings) {
      throw new NotFoundException(
        'Settings not found. Please initialize settings first.',
      );
    }

    await this.settingsRepo.update(
      { id: existingSettings.id },
      {
        usdToSsdRate: newRate,
        lastRateUpdate: new Date(),
        updatedAt: new Date(),
      },
    );

    const updated = await this.settingsRepo.findOne({
      where: { id: existingSettings.id },
    });
    if (!updated) {
      throw new NotFoundException('Settings not found');
    }
    return updated;
  }

  async getBackupSettings() {
    const settings = await this.getSettings();
    return {
      autoBackup: settings.autoBackup,
      backupFrequency: settings.backupFrequency,
      lastBackupAt: settings.lastBackupAt,
    };
  }
}
