from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class DaejeonOpenApiClient:
    def __init__(self) -> None:
        if not settings.daejeon_api_base_url or not settings.daejeon_api_path:
            raise RuntimeError("daejeon_openapi_not_configured")
        self._base = settings.daejeon_api_base_url.rstrip("/")
        self._path = settings.daejeon_api_path.lstrip("/")

    async def fetch(self, *, page_no: int = 1, num_of_rows: int = 200) -> dict[str, Any]:
        if not settings.daejeon_service_key:
            raise RuntimeError("daejeon_openapi_key_missing")

        url = f"{self._base}/{self._path}"
        # Many data.go.kr APIs accept these conventional params; if the dataset differs,
        # keep base/path in env and adjust param names in this module.
        params: dict[str, Any] = {
            "serviceKey": settings.daejeon_service_key,
            "pageNo": page_no,
            "numOfRows": num_of_rows,
            "_type": "json",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

