import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { CookiesService } from '../cookies/cookies.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { TokenClaim, TokenService } from '../token/token.service.js';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

type RequestWithUser = Request & {
  user?: TokenClaim;
  cookies: Record<string, string>;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly cookiesService: CookiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractAccessTokenCookie(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token cookie');
    }

    try {
      request.user = await this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractAccessTokenCookie(
    request: RequestWithUser,
  ): string | undefined {
    return request.cookies?.[this.cookiesService.getAccessCookieName()];
  }
}
