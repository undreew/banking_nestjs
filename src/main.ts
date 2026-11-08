import 'dotenv/config';
import { AppModule } from './app.module.js';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { GlobalExceptionFilter } from "./filters/global-exceptions.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: "Banking Nest JS"
    }),
  });

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}));
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
