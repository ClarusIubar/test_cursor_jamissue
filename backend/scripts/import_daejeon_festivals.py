from __future__ import annotations

import asyncio
from typing import Any

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.domain import MapPlace
from app.services.daejeon_openapi_client import DaejeonOpenApiClient


def pick_first(d: dict[str, Any], keys: list[str]) -> Any:
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return None


def parse_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    # Tries to handle common data.go.kr response shapes:
    # - {response:{body:{items:{item:[...]}}}}
    # - {data:[...]} or {items:[...]}
    resp = payload.get("response")
    if isinstance(resp, dict):
        body = resp.get("body") or {}
        items = body.get("items") or {}
        item = items.get("item")
        if item is None:
            return []
        if isinstance(item, list):
            return item
        if isinstance(item, dict):
            return [item]
    for k in ("data", "items", "item", "list"):
        v = payload.get(k)
        if isinstance(v, list):
            return v
    return []


def to_float(v: Any) -> float | None:
    try:
        if v is None or v == "":
            return None
        return float(v)
    except (TypeError, ValueError):
        return None


async def main() -> None:
    client = DaejeonOpenApiClient()
    page_no = 1
    imported = 0

    while True:
        data = await client.fetch(page_no=page_no, num_of_rows=200)
        items = parse_items(data)
        if not items:
            break

        async with SessionLocal() as db:
            for it in items:
                title = pick_first(it, ["festivalName", "festNm", "fest_name", "title", "name", "축제명"])
                if not title:
                    continue

                lat = to_float(pick_first(it, ["lat", "latitude", "mapy", "y", "위도"]))
                lng = to_float(pick_first(it, ["lng", "longitude", "mapx", "x", "경도"]))
                if lat is None or lng is None:
                    continue

                src_id = pick_first(it, ["id", "festId", "festivalId", "contentid", "축제ID"])
                source_ref = f"daejeon_festival:{src_id}" if src_id else f"daejeon_festival:{title}"

                exists = await db.scalar(select(MapPlace).where(MapPlace.source_ref == source_ref))
                if exists:
                    continue

                address = pick_first(it, ["addr", "address", "placeAddr", "addr1", "장소", "주소"])
                # Hybrid mapping: store raw type as part of source_ref if present
                raw_type = pick_first(it, ["type", "category", "festType", "축제구분"])
                if raw_type:
                    source_ref = f"{source_ref}|type={raw_type}"

                db.add(
                    MapPlace(
                        title=str(title).strip(),
                        category="culture",
                        lat=lat,
                        lng=lng,
                        address=str(address).strip() if address else None,
                        source_ref=str(source_ref),
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

