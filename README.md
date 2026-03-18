## 잼있슈 MVP (로컬 화면 테스트까지)

### 0) 준비물
- Docker Desktop
- Node.js
- Python

### 1) DB(Postgres) 실행

```bash
docker compose up -d
```

### 2) Backend 실행(마이그레이션 + 시드)

```bash
cd backend
cp .env.example .env
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt

# 마이그레이션 적용
python -m alembic upgrade head

# (선택) 시드 스크립트 방식
python scripts/seed_places.py

# 서버 실행
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 서버 동작/내용 확인용 엔드포인트
- `GET /` → 서버 기본 상태
- `GET /healthz` → 헬스체크
- `GET /docs` → Swagger UI
- `GET /api/v1/dev/status` → DB 연결 상태 포함 개발 상태
- `GET /api/v1/dev/sample-places` → DB 없이도 샘플 장소 내용 확인 가능

개발 편의용 엔드포인트(ENV=dev일 때만):
- `POST /api/v1/dev/seed-places` (샘플 장소 적재)
- `POST /api/v1/dev/import-tourapi` (TourAPI로 대전 데이터 적재: `TOURAPI_SERVICE_KEY` 필요)
- `POST /api/v1/dev/import-daejeon-festivals` (대전 문화축제 OpenAPI import: `DAEJEON_*` 3종 필요)
- `POST /api/v1/dev/login` (네이버 없이 JWT 발급)

### 3) Frontend 실행(지도/피드 화면)

```bash
cd frontend
cp .env.example .env
# .env에 VITE_KAKAO_MAP_KEY 설정(카카오 지도)
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

코드 품질 확인:
```bash
npm run lint
npm run build
```

### 3-1) Cloudflare 배포 시 입력해야 하는 키/시크릿

아래 값들은 직접 입력해야 하는 항목입니다.

#### A. Worker (workers/api-proxy) 시크릿
- 필수: `BACKEND_ORIGIN`
    - 값 예시: `https://api.your-domain.com`
    - 의미: Worker가 프록시할 실제 백엔드 주소

입력 명령:
```bash
cd workers/api-proxy
npx wrangler login
npx wrangler secret put BACKEND_ORIGIN
# 프롬프트가 뜨면 실제 백엔드 URL 입력 (예: https://api.your-domain.com)
```

로컬 테스트용(선택):
```bash
cd workers/api-proxy
cp .dev.vars.example .dev.vars
# .dev.vars의 BACKEND_ORIGIN을 로컬/개발 백엔드 주소로 수정
npx wrangler dev --config wrangler.toml --ip 127.0.0.1 --port 8787
```

#### B. Frontend (frontend) 빌드 키
- 필수: `VITE_API_BASE_URL`
    - 값 예시: `https://jamissyu-api-proxy.<subdomain>.workers.dev/api/v1`
- 선택: `VITE_KAKAO_MAP_KEY`
    - 값이 없으면 지도 SDK 기능은 제한될 수 있음

로컬 파일 입력:
```bash
cd frontend
cp .env.example .env
# .env에서 VITE_API_BASE_URL, VITE_KAKAO_MAP_KEY 설정
```

#### C. Backend (backend) 환경키
- 필수:
    - `DATABASE_URL`
    - `JWT_SECRET`
    - `FRONTEND_ORIGIN`
- 네이버 로그인 사용 시 필수:
    - `NAVER_CLIENT_ID`
    - `NAVER_CLIENT_SECRET`
    - `NAVER_REDIRECT_URI`
- 데이터 import 사용 시 선택:
    - `TOURAPI_SERVICE_KEY`
    - `DAEJEON_API_BASE_URL`
    - `DAEJEON_API_PATH`
    - `DAEJEON_SERVICE_KEY`

> 요약: Worker는 `BACKEND_ORIGIN` 시크릿을 반드시 넣어야 실제 백엔드로 프록시됩니다.

### 4) 화면으로 MVP 동작 테스트 플로우
- **(키가 없으면)** 우측 상단의 `seed`, `dev 로그인`으로도 피드 작성 흐름까지 테스트 가능
- **(카카오 키가 있으면)** 지도에 빵 마커가 뜨고,
  - 마커 **단일 탭**: 토스트 카드
  - 마커 **더블 탭**: 상세 피드(`/feed/:placeId`)
  - 상세에서 **현재 위치로 피드 남기기** → 서버가 **50m** 검증 후 저장

상세 내용은 `walkthrough.md` 참고.

