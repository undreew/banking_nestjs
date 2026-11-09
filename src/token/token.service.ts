import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '../generated/prisma/client.js';

export interface TokenClaim {
  sub: string;
  role: Role;
  email: string;
  type: TokenType;
}

type TokenType = 'access' | 'refresh';

@Injectable()
export class TokenService {
  private readonly accessTokenTtl: StringValue;
  private readonly refreshTokenTtl: StringValue;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenTtl = this.getConfig<StringValue>(
      configService,
      'ACCESS_TOKEN_TTL',
    );
    this.refreshTokenTtl = this.getConfig<StringValue>(
      configService,
      'REFRESH_TOKEN_TTL',
    );
    this.accessTokenSecret = this.getConfig<string>(
      configService,
      'ACCESS_TOKEN_SECRET',
    );
    this.refreshTokenSecret = this.getConfig<string>(
      configService,
      'REFRESH_TOKEN_SECRET',
    );
  }

  public async issueAccessToken(user: User) {
    return await this.jwtService.signAsync(this.buildClaims(user, 'access'), {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenTtl,
    });
  }

  public async issueRefreshToken(user: User) {
    return await this.jwtService.signAsync(this.buildClaims(user, 'refresh'), {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenTtl,
    });
  }

  public async verifyAccessToken(token: string): Promise<TokenClaim> {
    return await this.jwtService.verifyAsync<TokenClaim>(token, {
      secret: this.accessTokenSecret,
    });
  }

  public async verifyRefreshToken(token: string): Promise<TokenClaim> {
    return await this.jwtService.verifyAsync<TokenClaim>(token, {
      secret: this.refreshTokenSecret,
    });
  }

  private parse(value: string) {
    return this.jwtService.decode(value);
  }

  private getConfig<T>(service: ConfigService, key: string): T {
    return service.getOrThrow<T>(key);
  }

  private buildClaims(user: User, type: TokenType): TokenClaim {
    return { sub: user.id, role: user.role, email: user.email, type };
  }

  public getAccessTokenTtl() {
    return this.accessTokenTtl;
  }

  public getRefreshTokenTtl() {
    return this.refreshTokenTtl;
  }
}
