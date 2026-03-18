from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import settings


logger = logging.getLogger("jamissyu")


def create_app() -> FastAPI:
    app = FastAPI(default_response_class=ORJSONResponse)

    @app.get("/")
    async def root_status() -> dict[str, str]:
        return {"service": "jamissyu-backend", "status": "ok"}

    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "ok"}

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_: Request, exc: StarletteHTTPException):
        if exc.status_code == 404:
            return ORJSONResponse(
                status_code=404,
                content={
                    "error_code": "BREAD_NOT_FOUND",
                    "message": "식빵이 길을 잃었어요!",
                    "hint": "endpoint를 확인해 주세요",
                },
            )
        return ORJSONResponse(
            status_code=exc.status_code,
            content={
                "error_code": "BREAD_HTTP_ERROR",
                "message": "식빵이 잠깐 부서졌어요!",
                "hint": str(exc.detail),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception):
        logger.exception("unhandled_exception", exc_info=exc)
        return ORJSONResponse(
            status_code=500,
            content={
                "error_code": "BREAD_BURNT",
                "message": "식빵이 탔어요!",
                "hint": "잠시 후 다시 시도해 주세요",
            },
        )

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()

