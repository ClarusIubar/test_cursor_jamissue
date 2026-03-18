from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class TourApiClient:
    def __init__(self) -> None:
        self._base = settings.tourapi_base_url.rstrip("/")

    async def area_based_list(
        self,
        *,
        area_code: int,
        sigungu_code: int | None = None,
        page_no: int = 1,
        num_of_rows: int = 200,
    ) -> dict[str, Any]:
        if not settings.tourapi_service_key:
            raise RuntimeError("tourapi_not_configured")

        url = f"{self._base}/areaBasedList1"
        params: dict[str, Any] = {
            "serviceKey": settings.tourapi_service_key,
            "MobileOS": "WEB",
            "MobileApp": "jamissyu",
            "_type": "json",
            "arrange": "O",
            "areaCode": area_code,
            "pageNo": page_no,
            "numOfRows": num_of_rows,
        }
        if sigungu_code is not None:
            params["sigunguCode"] = sigungu_code

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

