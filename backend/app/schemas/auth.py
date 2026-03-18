from __future__ import annotations

from pydantic import BaseModel


class LoginUrlResponse(BaseModel):
    auth_url: str
    state_token: str


class NaverCallbackRequest(BaseModel):
    code: str
    state: str
    state_token: str


class UserPublic(BaseModel):
    id: str
    naver_id: str
    nickname: str | None = None
    profile_image_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

