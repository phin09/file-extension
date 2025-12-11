# GCP Cloud Run 배포 가이드

이 문서는 파일 확장자 차단 애플리케이션을 GCP Cloud Run에 배포하는 방법을 설명합니다.

## 📋 사전 준비

### 1. GCP 계정 및 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 ID를 기억해두세요 (예: `my-project-12345`)

### 2. gcloud CLI 설치 및 인증

```bash
# gcloud CLI 설치 (Mac)
brew install google-cloud-sdk

# 인증
gcloud auth login

# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID
```

### 3. 필요한 API 활성화

GCP Console에서 다음 API를 활성화합니다:

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 🗄️ Cloud SQL (MySQL) 설정

### 1. Cloud SQL 인스턴스 생성

#### 공개 IP 사용

```bash
gcloud sql instances create file-extension-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --root-password=YOUR_ROOT_PASSWORD
```

**설정값:**
- `file-extension-db`: 인스턴스 이름
- `db-f1-micro`: 무료 tier (프로덕션에서는 더 높은 tier 사용)
- `asia-northeast3`: 서울 리전
- `YOUR_ROOT_PASSWORD`: root 비밀번호 (안전하게 보관)


### 2. 데이터베이스 생성

```bash
gcloud sql databases create file_extension_blocker \
  --instance=file-extension-db
```

### 3. 데이터베이스 사용자 생성

```bash
gcloud sql users create app_user \
  --instance=file-extension-db \
  --password=YOUR_APP_PASSWORD
```

### 4. Cloud SQL 인스턴스 연결 이름 확인 
이하 YOUR_INSTANCE_CONNECTION_NAME

```bash
gcloud sql instances describe file-extension-db \
  --format="value(connectionName)"
```

출력 예시: `my-project-12345:asia-northeast3:file-extension-db`

cloudbuild.yaml에서 이 값을 `_CLOUDSQL_INSTANCE` 변수로 사용합니다.

---

## 🔐 Secret Manager 설정

데이터베이스 연결 정보를 Secret Manager에 저장합니다.

### 1. Secret 생성

Cloud Run에서 Cloud SQL에 연결할 때는 **Unix 소켓**을 통해 Private 연결을 사용합니다.

```bash
# DB 호스트 (Unix 소켓 경로)
echo -n "/cloudsql/YOUR_INSTANCE_CONNECTION_NAME" | \
  gcloud secrets create DB_HOST --data-file=-

# DB 포트
echo -n "3306" | \
  gcloud secrets create DB_PORT --data-file=-

# DB 사용자명
echo -n "app_user" | \
  gcloud secrets create DB_USERNAME --data-file=-

# DB 비밀번호
echo -n "YOUR_APP_PASSWORD" | \
  gcloud secrets create DB_PASSWORD --data-file=-

# DB 이름
echo -n "file_extension_blocker" | \
  gcloud secrets create DB_DATABASE --data-file=-
```

### 2. Secret 접근 권한 부여

```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding DB_HOST \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE에 대해서도 동일하게 실행
```

---

## 🚀 배포

### 방법 1: Cloud Build를 통한 자동 배포 (권장)

```bash
# cloudbuild.yaml에서 _CLOUDSQL_INSTANCE 변수 설정 필요
gcloud builds submit \
  --substitutions=_CLOUDSQL_INSTANCE="YOUR_INSTANCE_CONNECTION_NAME"
```

### 방법 2: 수동 배포

#### 1단계: Docker 이미지 빌드 및 푸시

```bash
# Artifact Registry 저장소 생성 (처음 한 번만)
gcloud artifacts repositories create file-extension-repo \
  --repository-format=docker \
  --location=asia-northeast3

# Docker 인증 설정
gcloud auth configure-docker asia-northeast3-docker.pkg.dev

# 이미지 빌드 (Cloud Run용 amd64 플랫폼)
docker buildx build --platform linux/amd64 \
  -t asia-northeast3-docker.pkg.dev/YOUR_PROJECT_ID/file-extension-repo/file-extension-blocker:latest \
  --push .
```

> **💡 Apple Silicon (M1/M2/M3) Mac 사용자:**
> - `--platform linux/amd64` 옵션이 **필수**입니다
> - Cloud Run은 amd64/linux만 지원합니다
> - `--push` 옵션을 사용하면 빌드와 푸시를 동시에 수행합니다
> - 또는 Cloud Build를 사용하면 자동으로 올바른 플랫폼으로 빌드됩니다 (권장)

#### 2단계: Cloud Run 배포

```bash
gcloud run deploy file-extension-blocker \
  --image=asia-northeast3-docker.pkg.dev/YOUR_PROJECT_ID/file-extension-repo/file-extension-blocker:latest \
  --region=asia-northeast3 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars=NODE_ENV=production \
  --add-cloudsql-instances=YOUR_INSTANCE_CONNECTION_NAME \
  --set-secrets=DB_HOST=DB_HOST:latest,DB_PORT=DB_PORT:latest,DB_USERNAME=DB_USERNAME:latest,DB_PASSWORD=DB_PASSWORD:latest,DB_DATABASE=DB_DATABASE:latest
```

---

## ✅ 배포 확인

### 1. 서비스 URL 확인

```bash
gcloud run services describe file-extension-blocker \
  --region=asia-northeast3 \
  --format="value(status.url)"
```

### 2. 헬스 체크

```bash
curl https://YOUR_SERVICE_URL/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T13:00:00.000Z"
}
```

### 3. 브라우저에서 접속

```
https://YOUR_SERVICE_URL
```

---

## 🔄 업데이트

코드 변경 후 재배포:

```bash
# Cloud Build 사용 시
gcloud builds submit \
  --substitutions=_CLOUDSQL_INSTANCE="YOUR_INSTANCE_CONNECTION_NAME"

# 수동 배포 시
docker build -t asia-northeast3-docker.pkg.dev/YOUR_PROJECT_ID/file-extension-repo/file-extension-blocker:latest .
docker push asia-northeast3-docker.pkg.dev/YOUR_PROJECT_ID/file-extension-repo/file-extension-blocker:latest
gcloud run services update file-extension-blocker \
  --image=asia-northeast3-docker.pkg.dev/YOUR_PROJECT_ID/file-extension-repo/file-extension-blocker:latest \
  --region=asia-northeast3
```

또는 Cloud Run에 Github Repository 연결

---

## 📚 참고 자료

- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Secret Manager 문서](https://cloud.google.com/secret-manager/docs)
- [Cloud Build 문서](https://cloud.google.com/build/docs)

