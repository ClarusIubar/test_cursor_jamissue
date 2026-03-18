from __future__ import annotations

import asyncio
from typing import Any

from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.domain import MapPlace
from app.services.tourapi_client import TourApiClient


def category_from_contenttypeid(contenttypeid: str | int | None) -> str:
    v = str(contenttypeid or "")
    # TourAPI contenttypeid common values:
    # 12 관광지, 14 문화시설, 15 축제/공연/행사, 39 음식점
    if v == "39":
        return "food"
    if v in {"14", "15"}:
        return "culture"
    if v == "12":
        return "spot"
    return "spot"


def parse_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    resp = payload.get("response") or {}
    body = resp.get("body") or {}
    items = body.get("items") or {}
    item = items.get("item")
    if item is None:
        return []
    if isinstance(item, list):
        return item
    return [item]


async def main() -> None:
    client = TourApiClient()

    page_no = 1
    imported = 0
    while True:
        data = await client.area_based_list(area_code=settings.tourapi_area_code, page_no=page_no, num_of_rows=200)
        items = parse_items(data)
        if not items:
            break

        async with SessionLocal() as db:
            for it in items:
                title = (it.get("title") or "").strip()
                if not title:
                    continue
                content_id = str(it.get("contentid") or "").strip()
                source_ref = f"tourapi:{content_id}" if content_id else "tourapi"

                lat = it.get("mapy")
                lng = it.get("mapx")
                if lat is None or lng is None:
                    continue

                exists = await db.scalar(select(MapPlace).where(MapPlace.source_ref == source_ref))
                if exists:
                    continue

                db.add(
                    MapPlace(
                        title=title,
                        category=category_from_contenttypeid(it.get("contenttypeid")),
                        lat=float(lat),
                        lng=float(lng),
                        address=(it.get("addr1") or None),
                        source_ref=source_ref,
                    )
                )
                imported += 1
            await db.commit()

        page_no += 1
        if page_no > 50:
            break

    print(f"imported={imported}")


if __name__ == "__main__":
    asyncio.run(main())

