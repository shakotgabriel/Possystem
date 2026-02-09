import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '../database/enums';
import { User } from '../database/entities';
import { TokenBlacklistService } from './token-blacklist.service';

export type JwtPayload = {
  sub: string;
  username: string;
  role: Role;
};

export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    this.logger.debug(`Attempting to validate user: ${username}`);

    if (!username || !password) {
      this.logger.debug('Username or password is missing');
      throw new UnauthorizedException('Username and password are required');
    }

    const user = await this.usersService.findByUsername(username);

    if (!user) {
      this.logger.debug(`User not found: ${username}`);
      throw new UnauthorizedException('Invalid username or password');
    }

    this.logger.debug(`User found, comparing passwords for: ${username}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.debug(`Invalid password for user: ${username}`);
      throw new UnauthorizedException('Invalid username or password');
    }

    this.logger.debug(`User validated successfully: ${username}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as UserWithoutPassword;
  }

  login(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  logout(token: string): { message: string } {
    this.tokenBlacklistService.addToBlacklist(token);
    return { message: 'Successfully logged out' };
  }
}
