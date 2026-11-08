import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: config.getOrThrow<string>('DATABASE_HOST'),
      port: Number(config.get('DATABASE_PORT') ?? 3306),
      user: config.getOrThrow<string>('DATABASE_USER'),
      password: config.getOrThrow<string>('DATABASE_PASSWORD'),
      database: config.getOrThrow<string>('DATABASE_NAME'),
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
