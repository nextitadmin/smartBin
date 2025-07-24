import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';
import { readFileSync } from 'fs';
import { createTransport, Transporter } from 'nodemailer';
import { renderString } from 'nunjucks';
import path from 'path';

@Injectable()
export class MailerService {
  private mailer: Transporter;
  constructor(private readonly configService: ConfigService<ConfigAttributes>) {
    const { smtp_host, smtp_password, smtp_user, smtp_port } =
      this.configService.get('mail', { infer: true });

    this.mailer = createTransport({
      host: smtp_host,
      port: +smtp_port,
      auth: {
        user: smtp_user,
        pass: smtp_password,
      },
    });
  }

  compileTemplate(templateName: string, context: Record<string, any>) {
    try {
      const templateFilePath = path.join(
        __dirname,
        `../assets/${templateName}.html`,
      );
      console.log(templateFilePath);
      const getFileContent = readFileSync(templateFilePath).toString();
      return renderString(getFileContent, {
        ...context,
      });
    } catch (error) {
      throw new Error(
        `Template '${templateName}.html' not found in assets directory`,
      );
    }
  }

  async sendMail(options: any) {
    options.html = this.compileTemplate(options.template, options.context);
    options.from = '"LAWMA REG" <no-reply@healthrak.com>'; // will remove later
    await this.mailer.sendMail(options).then(console.log).catch(console.error);
  }
}
