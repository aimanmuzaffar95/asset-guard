import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exception-filters/all-exceptions-filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000'];

const parseCsvList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const createCorsOptions = (configService: ConfigService): CorsOptions => {
  const configuredOrigins = parseCsvList(
    configService.get<string>('CORS_ALLOWED_ORIGINS'),
  );
  const allowCredentials = parseBoolean(
    configService.get<string>('CORS_ALLOW_CREDENTIALS'),
    false,
  );
  const allowedOrigins = new Set([
    ...DEFAULT_CORS_ORIGINS,
    ...configuredOrigins,
  ]);
  const hasExplicitOriginList =
    allowedOrigins.size > DEFAULT_CORS_ORIGINS.length;

  return {
    origin: (origin, callback): void => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!hasExplicitOriginList && !allowCredentials) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'Origin',
      'X-Requested-With',
    ],
    credentials: allowCredentials,
    optionsSuccessStatus: 204,
    preflightContinue: false,
  };
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors(createCorsOptions(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Asset Guard API')
    .setDescription('The Asset Guard API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    // To load Swagger on vercel
    customSiteTitle: 'Backend Generator',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
    ],
  });

  const port = Number(configService.get<string>('PORT') || 3000);
  await app.listen(port);
}
void bootstrap();
