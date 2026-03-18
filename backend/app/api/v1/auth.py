from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user_id
from app.core.security import create_access_token, create_oauth_state_token, verify_oauth_state_token
from app.db.session import get_db
from app.models.domain import User
from app.schemas.auth import LoginUrlResponse, NaverCallbackRequest, TokenResponse, UserPublic
from app.services.naver_oauth import build_naver_auth_url, exchange_code_for_token, fetch_profile


router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/naver/login", response_model=LoginUrlResponse)
async def naver_login() -> LoginUrlResponse:
    from app.core.config import settings

    if not settings.naver_client_id or not settings.naver_client_secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="naver_not_configured")
    state = secrets.token_urlsafe(24)
    auth_url = build_naver_auth_url(state=state)
    state_token = create_oauth_state_token(state=state)
    return LoginUrlResponse(auth_url=auth_url, state_token=state_token)


@router.post("/naver/callback", response_model=TokenResponse)
async def naver_callback(payload: NaverCallbackRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        verify_oauth_state_token(state_token=payload.state_token, state=payload.state)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_state")

    access_token = await exchange_code_for_token(code=payload.code, state=payload.state)
    profile = await fetch_profile(access_token=access_token)

    naver_id = str(profile.get("id") or "")
    if not naver_id:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="naver_profile_missing")

    nickname = profile.get("nickname")
    profile_image = profile.get("profile_image")

    existing = await db.scalar(select(User).where(User.naver_id == naver_id))
    if existing is None:
        user = User(naver_id=naver_id, nickname=nickname, profile_image_url=profile_image)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        existing.nickname = nickname or existing.nickname
        existing.profile_image_url = profile_image or existing.profile_image_url
        await db.commit()
        await db.refresh(existing)
        user = existing

    jwt_access = create_access_token(subject=str(user.id))
    return TokenResponse(
        access_token=jwt_access,
        user=UserPublic(id=str(user.id), naver_id=user.naver_id, nickname=user.nickname, profile_image_url=user.profile_image_url),
    )


@router.get("/me", response_model=UserPublic)
async def me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user_not_found")
    return UserPublic(id=str(user.id), naver_id=user.naver_id, nickname=user.nickname, profile_image_url=user.profile_image_url)

