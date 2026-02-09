import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { AuthService, UserWithoutPassword } from '../auth/auth.service';
import { Role } from '../database/enums';
import { User } from '../database/entities';
import { InitializeSetupDto } from './dtos/initialize-setup.dto';

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getStatus(): Promise<{
    initialized: boolean;
    hasAdmin: boolean;
  }> {
    const [initialized, adminCount] = await Promise.all([
      this.settingsService.isInitialized(),
      this.usersRepo.count({ where: { role: Role.ADMIN } }),
    ]);

    return {
      initialized,
      hasAdmin: adminCount > 0,
    };
  }

  async initialize(dto: InitializeSetupDto) {
    const status = await this.getStatus();

    if (status.initialized && status.hasAdmin) {
      throw new BadRequestException('Setup already completed');
    }

    const settings = status.initialized
      ? await this.settingsService.getSettings()
      : await this.settingsService.initializeSettings(dto.initialRate);

    let user: UserWithoutPassword;

    if (!status.hasAdmin) {
      user = (await this.usersService.create({
        name: dto.name,
        username: dto.username,
        password: dto.password,
        role: Role.ADMIN,
      })) as unknown as UserWithoutPassword;
    } else {
      const validated = await this.authService.validateUser(
        dto.username,
        dto.password,
      );
      if (!validated) {
        throw new BadRequestException('Invalid admin credentials');
      }
      if (validated.role !== Role.ADMIN) {
        throw new BadRequestException('Provided user is not an admin');
      }
      user = validated;
    }

    const login = this.authService.login(user);

    this.logger.log(`Initial setup completed for admin: ${dto.username}`);

    return {
      settings,
      ...login,
    };
  }
}
