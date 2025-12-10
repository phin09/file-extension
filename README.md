# 파일 확장자 차단 설정 관리

파일 확장자 차단 설정을 관리하는 웹 애플리케이션입니다.

## 기능

- 고정 확장자 선택 (bat, cmd, com, cpl, exe, scr, js)
- 커스텀 확장자 추가 (최대 200개)
- 차단 설정 저장 및 관리

## 기술 스택

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: MySQL
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Deploy**: GCP Cloud Run

## 로컬 개발 환경 설정

### 1. 환경 변수 설정

```bash
cp env.example .env
# .env 파일을 열어 데이터베이스 설정 입력
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

- `GET /api/blocked-extensions` - 차단된 확장자 목록 조회
- `POST /api/blocked-extensions` - 차단 확장자 추가
- `DELETE /api/blocked-extensions/:id` - 차단 확장자 삭제

## 배포

GCP Cloud Run 배포 가이드는 추후 작성 예정입니다.

