## 잼있슈 MVP Walkthrough

### 1) 실행 방법

#### Backend
- **설치/실행**: `backend/README.md` 참고
- 기본 주소: `http://127.0.0.1:8000`

#### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_KAKAO_MAP_KEY 채우기
npm run dev -- --host 127.0.0.1 --port 5173
```

### 2) 구현 결과 요약

#### Backend (FastAPI + Postgres/Supabase)
- **DB 모델 + FK/인덱스**
  - `backend/app/models/domain.py`에 `users`, `map`, `feed`, `comment` ORM 정의
  - Alembic 마이그레이션: `backend/alembic/versions/0001_init_schema.py`
- **네이버 OAuth2 + JWT**
  - `GET /api/v1/auth/naver/login` → `{ auth_url, state_token }`
  - `POST /api/v1/auth/naver/callback` → `{ access_token, user }`
  - `GET /api/v1/auth/me` (Bearer) → 사용자 정보
- **GPS 50m 서버 검증 (Haversine)**
  - `POST /api/v1/feed`에서 `lat/lng` ↔ `map.lat/lng` 거리 계산 후 **50m 초과 시 403**
  - 최소치 위치 조작 대응: `stamp_rejected` 로그에 `ip/ua/거리` 기록
- **권한 위반 차단**
  - `DELETE /api/v1/feed/{id}`: 작성자만 삭제 가능
  - `DELETE /api/v1/comments/{id}`: 작성자만 삭제 가능
- **식빵 테마 에러 JSON**
  - 404: `BREAD_NOT_FOUND`
  - 500: `BREAD_BURNT`

#### Frontend (React)
- **지도 + 빵 마커 + 잼 필터**
  - `frontend/src/components/map/MainMap.tsx`
  - 카테고리 필터: `맛집/명소/카페/문화` (잼색)
- **노스크롤 터치/탭 인터랙션**
  - 마커 **단일 탭**: `ToastPopup` 카드 노출
  - 마커 **더블 탭(320ms)**: 상세 피드 화면(`/feed/:placeId`) 이동
- **네이버 로그인 상태 관리**
  - `frontend/src/hooks/useAuth.ts`에서 JWT localStorage 저장/`/auth/me` 확인
  - 콜백 페이지: `/auth/naver/callback`
- **식빵 에러 UI**
  - API 에러(JSON의 `message/error_code`)를 페이지 에러 영역에 노출

### 3) 테스트/검증 체크(로컬)
- **빌드**
  - Frontend: `npm run build` 성공
- **API 간단 확인**
  - 존재하지 않는 경로 호출 시 404 JSON(식빵 테마) 반환

### 4) 남은 연결(실데이터)
- `map` 테이블에 공공데이터포털 기반 장소를 적재해야 실제 마커가 표시됩니다.
- 네이버 OAuth는 `NAVER_CLIENT_ID/SECRET/REDIRECT_URI`를 `.env`에 설정해야 동작합니다.

