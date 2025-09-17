// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import helmet from 'helmet';
// import { GlobalExceptionFilter } from './common/filters/exception.filter';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { Logger } from 'nestjs-pino';
// import { ConfigService } from '@nestjs/config';
// import { ConfigAttributes } from './config';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
// import session from 'express-session';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { LawmaModule } from './lawma/lawma.module';

// export async function setupLawmaModule() {
//   const app = await NestFactory.create<NestExpressApplication>(LawmaModule, {
//     bufferLogs: true,
//   });
//   const config = app.get(ConfigService<ConfigAttributes>);

//   app.useLogger(app.get(Logger));

//   app.enableCors({
//     origin: '*',
//   });
//   app.use(
//     helmet({
//       xPoweredBy: false,
//     }),
//   );

//   app.use(
//     session({
//       secret: config.get('SESSION_SECRET') || 'default_session_secret',
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         httpOnly: true,
//         maxAge: 60 * 60 * 1000, // 1 hour
//       },
//     }),
//   );

//   app.enableVersioning();
//   app.useGlobalPipes(new ValidationPipe());
//   app.useGlobalFilters(new GlobalExceptionFilter());

//   const swaggerConfig = new DocumentBuilder()
//     .setTitle('Smartbin LAWMA ADMIN backend Documentation')
//     .setDescription('')
//     .addBearerAuth(
//       { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
//       'access-token',
//     )
//     .addSecurityRequirements('access-token')
//     .setVersion('1.0')
//     .addTag('smartbin-lawma')
//     .build();
//   const documentFactory = () =>
//     SwaggerModule.createDocument(app, swaggerConfig);
//   SwaggerModule.setup('docs', app, documentFactory, {
//     swaggerOptions: {
//       tagSorting: 'alpha',
//       docExpansion: 'list',
//       operationsSorter: 'alpha',
//       persistAuthorization: true,
//       displayRequestDuration: true,
//     },
//   });

//   const port = config.get('port', { infer: true });
//   await app.listen(port);
// }
