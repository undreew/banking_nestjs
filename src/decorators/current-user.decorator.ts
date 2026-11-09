import type { TokenClaim } from '../token/token.service.js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenClaim => {
    return ctx.switchToHttp().getRequest().user;
  },
);
