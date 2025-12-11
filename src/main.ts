import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS 설정
  app.enableCors();
  
  // 정적 파일 서빙 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // 전역 API prefix 설정
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다`);
}

bootstrap();

