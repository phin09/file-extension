# 파일 확장자 차단 설정 관리

파일 확장자 차단 설정을 관리하는 웹 애플리케이션입니다.

## 기능

- 고정 확장자 (bat, cmd, com, cpl, exe, scr, js) check/uncheck로 설정
- 커스텀 확장자 추가 (20자 이내, 최대 200개)
- 추가된 커스텀 확장자 옆 X 클릭시 db에서 삭제
- 차단한 확장자 설정 저장 및 새로고침시에도 유지

### 고려사항
- 영어 입력시 소문자로 변환하여 저장
- 중복된 커스텀 확장자를 추가하는 경우
- 고정 확장자 목록에 있는 확장자를 커스텀 확장자로 추가하는 경우
- 체크된 고정 확장자를 커스텀 확장자로 추가하는 경우
- 알려지지 않은 확장자를 커스텀 확장자로 추가하려는 경우 사용자의 승인 하에 저장

## 기술 스택

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: MySQL
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Deploy**: GCP Cloud Run

## 로컬 개발 환경 설정

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=file_extension_blocker
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

MySQL 데이터베이스를 생성하고 `.env` 파일에 연결 정보를 입력합니다.

### 4. 개발 서버 실행

```bash
npm run start:dev
```

서버는 `http://localhost:3000` 에서 실행됩니다.

## API 엔드포인트

- `GET /api/blocked-extension` - 차단된 확장자 목록 조회
- `POST /api/blocked-extension` - 차단 확장자 추가
- `DELETE /api/blocked-extension/:id` - 차단 확장자 삭제

## 배포


이 애플리케이션은 Google Cloud Platform의 Cloud Run에 배포할 수 있습니다.

**배포 가이드:** [DEPLOY.md](./DEPLOY.md) 참고

#### 필요한 GCP 서비스

- **Cloud Run**: 애플리케이션 호스팅
- **Cloud SQL (MySQL)**: 데이터베이스
- **Secret Manager**: 환경변수 관리
- **Cloud Build**: 자동 빌드 및 배포
- **Container Registry**: Docker 이미지 저장
