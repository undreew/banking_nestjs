import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { EncoderService } from './encoder.service.js';
import { AUDIT_ACTIONS } from '../constants/audit.js';
import { User } from '../users/entities/user.entity.js';
import { TokenService } from '../token/token.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly encoder: EncoderService,
    private readonly tokenService: TokenService,
  ) {}

  async getCurrentUser(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new User(user);
  }

  async register(payload: RegisterDto) {
    const hashedPassword = await this.encoder.encrypt(payload.password);
    const registeredUser = await this.db.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        lastName: payload.lastName,
        firstName: payload.firstName,
      },
    });
    this.logger.log(AUDIT_ACTIONS.AUTH_REGISTER, { id: registeredUser.id });

    return new User(registeredUser);
  }

  async login(payload: LoginDto) {
    const registeredUser = await this.db.user.findUnique({
      where: { email: payload.email },
    });

    if (!registeredUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.encoder.decrypt(
      payload.password,
      registeredUser.password,
    );

    if (!isMatch || !registeredUser.enabled) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(AUDIT_ACTIONS.AUTH_LOGIN, { id: registeredUser.id });

    return this.issueTokenPair(registeredUser);
  }

  private async issueTokenPair(user: User) {
    return {
      accessToken: await this.tokenService.issueAccessToken(user),
      refreshToken: await this.tokenService.issueRefreshToken(user),
      body: {
        user: new User(user),
        accessTokenTtl: this.tokenService.getAccessTokenTtl(),
        refreshTokenTtl: this.tokenService.getRefreshTokenTtl(),
      },
    };
  }
}
