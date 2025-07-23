import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '.';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { LoggerModule } from 'nestjs-pino';
import { LoggerService } from '@nestjs/common';

export const mailerConfigOpts: any = {
  imports: [ConfigModule, LoggerModule],
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<ConfigAttributes>,
    logger: LoggerService,
  ) => {
    logger.log('hello');
    const { smtp_host, smtp_password, smtp_user, smtp_port } =
      configService.get('mail', { infer: true });

    if (!smtp_host || !smtp_user || !smtp_password || !smtp_port) {
      throw new Error('Missing SMTP configuration values');
    }
    console.log({ smtp_host, smtp_password }, 'passs');
    return {
      transport: {
        host: smtp_host,
        secure: false,
        port: +smtp_port,
        auth: {
          user: smtp_user,
          pass: smtp_password,
        },
      },
      defaults: {
        from: '"LAWMA" <notifications@lawma.co>',
      },
      template: {
        dir: __dirname + '/assets',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  },
};
