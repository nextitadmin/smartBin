import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  const config = app.get(ConfigService<ConfigAttributes>);

  app.enableCors({
    origin: '*',
  });
  app.use(helmet());

  app.enableVersioning();
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = config.get('port', { infer: true });
  await app.listen(port);
}
bootstrap();
