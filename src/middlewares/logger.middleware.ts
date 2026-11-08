import type { NextFunction, Request, Response } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      const ms = Date.now() - start;
      const line = `${method} ${originalUrl} ${statusCode} +${ms}ms`;

      if (statusCode >= 500) this.logger.error(line);
      else if (statusCode >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });

    next();
  }
}
