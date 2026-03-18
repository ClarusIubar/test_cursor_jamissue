from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(*, subject: str, expires_minutes: int | None = None, extra: dict[str, Any] | None = None) -> str:
    now = datetime.now(UTC)
    exp = now + timedelta(minutes=expires_minutes or settings.jwt_expires_min)
    payload: dict[str, Any] = {"sub": subject, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_alg)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_alg])


def create_oauth_state_token(*, state: str) -> str:
    return create_access_token(subject="oauth_state", expires_minutes=5, extra={"state": state})


def verify_oauth_state_token(*, state_token: str, state: str) -> None:
    try:
        payload = decode_token(state_token)
    except JWTError as e:
        raise ValueError("invalid_state_token") from e
    if payload.get("sub") != "oauth_state":
        raise ValueError("invalid_state_token")
    if payload.get("state") != state:
        raise ValueError("state_mismatch")

