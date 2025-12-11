# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 빌드된 파일과 public 폴더 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# 비루트 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# 포트 설정 (Cloud Run은 PORT 환경변수를 자동으로 설정)
# EXPOSE 8080

# 프로덕션 모드로 실행
CMD ["node", "dist/main.js"]

