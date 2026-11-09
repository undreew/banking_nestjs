import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/role.decorator.js';
import type { TokenClaim } from '../token/token.service.js';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndMerge(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: TokenClaim }>();

    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
