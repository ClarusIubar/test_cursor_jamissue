## Backend (FastAPI)

### Requirements
- Python 3.11+

### Setup

```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt
```

### Run (dev)

```bash
uvicorn app.main:app --reload --port 8000
```

### Environment
Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=change_me
JWT_ALG=HS256
JWT_EXPIRES_MIN=60

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=http://localhost:5173/auth/naver/callback

FRONTEND_ORIGIN=http://localhost:5173
```

