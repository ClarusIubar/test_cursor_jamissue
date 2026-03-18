from __future__ import annotations

import urllib.parse

import httpx

from app.core.config import settings


NAVER_AUTH_BASE = "https://nid.naver.com/oauth2.0/authorize"
NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token"
NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me"


def build_naver_auth_url(*, state: str, redirect_uri: str | None = None) -> str:
    params = {
        "response_type": "code",
        "client_id": settings.naver_client_id,
        "redirect_uri": redirect_uri or settings.naver_redirect_uri,
        "state": state,
    }
    return f"{NAVER_AUTH_BASE}?{urllib.parse.urlencode(params)}"


async def exchange_code_for_token(*, code: str, state: str, redirect_uri: str | None = None) -> str:
    params = {
        "grant_type": "authorization_code",
        "client_id": settings.naver_client_id,
        "client_secret": settings.naver_client_secret,
        "code": code,
        "state": state,
        "redirect_uri": redirect_uri or settings.naver_redirect_uri,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(NAVER_TOKEN_URL, data=params)
        resp.raise_for_status()
        data = resp.json()
    access_token = data.get("access_token")
    if not access_token:
        raise RuntimeError("naver_token_missing")
    return access_token


async def fetch_profile(*, access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(NAVER_PROFILE_URL, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    if data.get("resultcode") != "00":
        raise RuntimeError("naver_profile_error")
    return data.get("response") or {}

