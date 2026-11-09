import { Module } from '@nestjs/common';
import { CookiesService } from './cookies.service.js';

@Module({
  providers: [CookiesService],
  exports: [CookiesService],
})
export class CookiesModule {}
