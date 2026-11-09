import type { Response } from 'express';
import { LoginDto } from './dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { API_PATHS } from '../constants/api-paths.js';
import { Public } from '../decorators/public.decorator.js';
import type { TokenClaim } from '../token/token.service.js';
import { CookiesService } from '../cookies/cookies.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import {
  Body,
  Controller,
  Cookies,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';

@Controller(API_PATHS.AUTH.ROOT)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookiesService,
  ) {}

  @Get('me')
  getCurrentUser(@CurrentUser() actor: TokenClaim) {
    return this.authService.getCurrentUser(actor.sub);
  }

  @Public()
  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, body } =
      await this.authService.login(payload);

    this.cookieService.accessCookie(res, accessToken);
    this.cookieService.refreshCookie(res, refreshToken);

    return body;
  }

  @Public()
  @Post('refresh')
  refreshToken(@Cookies() cookies: Record<string, string>) {
    return 'Refreshing access token...';
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.expireAccessCookie(res);
    this.cookieService.expireRefreshCookie(res);
  }
}
