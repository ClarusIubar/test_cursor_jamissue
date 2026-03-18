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

### 4) 화면으로 MVP 동작 테스트 플로우
- **(키가 없으면)** 우측 상단의 `seed`, `dev 로그인`으로도 피드 작성 흐름까지 테스트 가능
- **(카카오 키가 있으면)** 지도에 빵 마커가 뜨고,
  - 마커 **단일 탭**: 토스트 카드
  - 마커 **더블 탭**: 상세 피드(`/feed/:placeId`)
  - 상세에서 **현재 위치로 피드 남기기** → 서버가 **50m** 검증 후 저장

상세 내용은 `walkthrough.md` 참고.

