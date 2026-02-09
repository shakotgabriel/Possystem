import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { UsersModule } from '../users/users.module';
import { User } from '../database/entities';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [SetupController],
  providers: [SetupService],
})
export class SetupModule {}
