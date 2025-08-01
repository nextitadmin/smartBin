import { ConfigAttributes } from '@src/config';
import { ConfigService } from '@nestjs/config';
import { IncomingMessage, ServerResponse } from 'http';
import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { SerializedRequest, SerializedResponse } from 'pino';
import { ApplicationEnvironment } from '@common/constants';

const getReqLogMsg = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => `${req.method} ${req.url} | ${res.statusCode}`;

export const getPinoConfig = (
  config: ConfigService<ConfigAttributes>,
): Params => {
  const loggingConfig = config.get('logging', { infer: true });
  return {
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname,remotePort,remoteAddress',
        },
      },
      level: loggingConfig.level,
      formatters: { level: (label) => ({ level: label }) },
      customLogLevel(_, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        }

        if (res.statusCode >= 500 || err) {
          return 'error';
        }

        return 'info';
      },
      customSuccessMessage: getReqLogMsg,
      customErrorMessage: getReqLogMsg,
      autoLogging: !loggingConfig.disableRequestLogging,
      serializers: {
        req: (req: SerializedRequest & { query: Record<string, string> }) => {
          const headers = req.headers || {};
          const appEnvironment = config.get('nodeEnv');
          const isProduction =
            appEnvironment === ApplicationEnvironment.Production;
          return {
            method: req.method,
            url: req.url,
            headers: {
              host: headers.host,
              userAgent: headers['user-agent'],
              ...(!isProduction && {
                'auth-type': headers['authorization']?.split(' ')[0],
                token: headers['authorization']?.split(' ')[1],
              }),
            },

            query: req.query,
          };
        },
        res: (res: SerializedResponse) => ({
          statusCode: res.statusCode,
          contentLength: Number(res?.headers['content-length']),
        }),
      },
    },
  };
};

export const loggerModuleOpts: LoggerModuleAsyncParams = {
  inject: [ConfigService],
  useFactory: (c: ConfigService<ConfigAttributes>) => getPinoConfig(c),
};
