                                                            
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  exp: number;
  [key: string]: unknown;
};

function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return (
    decoded !== null &&
    typeof decoded === 'object' &&
    'exp' in decoded &&
    typeof (decoded as { exp: unknown }).exp === 'number'
  );
}

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();

  constructor(private jwtService: JwtService) {}

  private decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = this.jwtService.decode(token, { json: true });
      return isJwtPayload(decoded) ? decoded : null;
    } catch {
      return null;
    }
  }

  addToBlacklist(token: string): void {
    const decoded = this.decodeToken(token);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      this.blacklistedTokens.add(token);
    }
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

                                                   
  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const token of this.blacklistedTokens) {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp * 1000 < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}
