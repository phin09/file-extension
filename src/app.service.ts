import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '파일 확장자 차단 설정 관리 API';
  }
}

