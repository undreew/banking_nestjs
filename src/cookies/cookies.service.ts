import ms from 'ms';
import type { StringValue } from 'ms';
import type { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { API_PATHS } from '../constants/api-paths.js';

interface CookieBuild {
  name: string;
  path: string;
  value: string;
  res: Response;
  duration: number;
}

@Injectable()
export class CookiesService {
  private readonly environment: string;
  private readonly accessCookieName: string;
  private readonly refreshCookieName: string;
  private readonly accessTokenTtl: StringValue;
  private readonly refreshTokenTtl: StringValue;

  constructor(
    private readonly host: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {
    this.environment = this.getConfig<string>(configService, 'ENVIRONMENT');
    this.accessCookieName = this.getConfig<string>(
      configService,
      'ACCESS_COOKIE',
    );
    this.refreshCookieName = this.getConfig<string>(
      configService,
      'REFRESH_COOKIE',
    );
    this.accessTokenTtl = this.getConfig<StringValue>(
      configService,
      'ACCESS_TOKEN_TTL',
    );
    this.refreshTokenTtl = this.getConfig<StringValue>(
      configService,
      'REFRESH_TOKEN_TTL',
    );
  }

  public accessCookie(res: Response, value: string) {
    this.buildCookie({
      res,
      value,
      path: API_PATHS.ROOT,
      name: this.accessCookieName,
      duration: this.convertTtl(this.accessTokenTtl),
    });
  }

  public refreshCookie(res: Response, value: string) {
    this.buildCookie({
      res,
      value,
      path: API_PATHS.AUTH,
      name: this.refreshCookieName,
      duration: this.convertTtl(this.refreshTokenTtl),
    });
  }

  private buildCookie(payload: CookieBuild) {
    const { name, value, path, duration, res } = payload;

    this.host.httpAdapter.setCookie(res, name, value, {
      path,
      httpOnly: true,
      maxAge: duration,
      sameSite: 'strict',
      secure: this.environment === 'production',
    });
  }

  private getConfig<T>(service: ConfigService, key: string): T {
    return service.getOrThrow<T>(key);
  }

  public getAccessCookieName(): string {
    return this.accessCookieName;
  }

  public getRefreshCookieName(): string {
    return this.refreshCookieName;
  }

  public convertTtl(ttl: StringValue): number {
    return ms(ttl) / 1000;
  }
}
