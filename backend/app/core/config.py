from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/jamissyu",
        validation_alias="DATABASE_URL",
    )

    jwt_secret: str = Field(default="change_me", validation_alias="JWT_SECRET")
    jwt_alg: str = Field(default="HS256", validation_alias="JWT_ALG")
    jwt_expires_min: int = Field(default=60, validation_alias="JWT_EXPIRES_MIN")

    naver_client_id: str = Field(default="", validation_alias="NAVER_CLIENT_ID")
    naver_client_secret: str = Field(default="", validation_alias="NAVER_CLIENT_SECRET")
    naver_redirect_uri: str = Field(
        default="http://localhost:5173/auth/naver/callback",
        validation_alias="NAVER_REDIRECT_URI",
    )

    frontend_origin: str = Field(default="http://localhost:5173", validation_alias="FRONTEND_ORIGIN")

    env: str = Field(default="dev", validation_alias="ENV")
    dev_auth_enabled: bool = Field(default=False, validation_alias="DEV_AUTH_ENABLED")

    tourapi_service_key: str = Field(default="", validation_alias="TOURAPI_SERVICE_KEY")
    tourapi_base_url: str = Field(
        default="https://apis.data.go.kr/B551011/KorService1",
        validation_alias="TOURAPI_BASE_URL",
    )
    tourapi_area_code: int = Field(default=3, validation_alias="TOURAPI_AREA_CODE")

    # Daejeon OpenAPI (data.go.kr dataset 15006969 - 문화축제 정보)
    daejeon_api_base_url: str = Field(default="", validation_alias="DAEJEON_API_BASE_URL")
    daejeon_api_path: str = Field(default="", validation_alias="DAEJEON_API_PATH")
    daejeon_service_key: str = Field(default="", validation_alias="DAEJEON_SERVICE_KEY")


settings = Settings()

