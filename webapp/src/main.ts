import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('CODE:RED')
    .setDescription('CODE:RED')
    .setVersion('1.0')
    .addTag('CODE:RED')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: [
      'http://localhost:3000/',
      'http://localhost:3000/auth/sign-in',
      'http://localhost:3000/notifications',
      'http://localhost:3000/api/firebase-config',
      'http://localhost:3000/save-token',
      'http://localhost:3000/chat',
      'http://localhost:3000/shelters/searchMap',
    ], // 허용할 origin (클라이언트 주소)
    methods: ['GET', 'POST'], // 허용할 HTTP 메서드
    allowedHeaders: ['Content-Type', '*'], // 허용할 요청 헤더
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  const helpers = {
    eq: (val1, val2) => val1 === val2,
    lengthOfList: (list = []) => list.length,
    dateString: (isoString) => new Date(isoString).toLocaleDateString(),
  };

  const hbsInstance = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views/layouts'),
    partialsDir: join(__dirname, '..', 'views/partials'),
    helpers,
  });

  app.engine('handlebars', hbsInstance.engine);
  app.setViewEngine('handlebars');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());
  const PORT = 3000;
  await app.listen(PORT);
  Logger.log(`${PORT}번 포트로 서버 실행 중...`);
}
bootstrap();
