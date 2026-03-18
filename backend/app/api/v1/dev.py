from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.domain import User
from app.schemas.auth import TokenResponse, UserPublic


router = APIRouter(prefix="/dev", tags=["dev"])


@router.post("/login", response_model=TokenResponse)
async def dev_login(db: AsyncSession = Depends(get_db)) -> TokenResponse:
    if settings.env != "dev" or not settings.dev_auth_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="not_found")

    naver_id = f"dev_{secrets.token_hex(6)}"
    user = User(naver_id=naver_id, nickname="개발용 식빵", profile_image_url=None)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    jwt_access = create_access_token(subject=str(user.id))
    return TokenResponse(
        access_token=jwt_access,
        user=UserPublic(
            id=str(user.id),
            naver_id=user.naver_id,
            nickname=user.nickname,
            profile_image_url=user.profile_image_url,
        ),
    )


@router.post("/seed-places", status_code=status.HTTP_204_NO_CONTENT)
async def seed_places(db: AsyncSession = Depends(get_db)) -> None:
    if settings.env != "dev":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="not_found")

    # Local import to avoid loading JSON on module import
    import json
    from pathlib import Path

    from app.models.domain import MapPlace

    seed_path = Path(__file__).resolve().parents[3] / "sample_data" / "daejeon_places_seed.json"
    items = json.loads(seed_path.read_text(encoding="utf-8"))

    for it in items:
        exists = await db.scalar(select(MapPlace).where(MapPlace.title == it["title"]))
        if exists:
            continue
        db.add(
            MapPlace(
                title=it["title"],
                category=it["category"],
                lat=float(it["lat"]),
                lng=float(it["lng"]),
                address=it.get("address"),
                source_ref=it.get("source_ref"),
            )
        )
    await db.commit()


@router.post("/import-tourapi", status_code=status.HTTP_204_NO_CONTENT)
async def import_tourapi(db: AsyncSession = Depends(get_db)) -> None:
    if settings.env != "dev":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="not_found")
    if not settings.tourapi_service_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tourapi_not_configured")

    from sqlalchemy import select

    from app.models.domain import MapPlace
    from app.services.tourapi_client import TourApiClient

    def category_from_contenttypeid(contenttypeid: str | int | None) -> str:
        v = str(contenttypeid or "")
        if v == "39":
            return "food"
        if v in {"14", "15"}:
            return "culture"
        if v == "12":
            return "spot"
        return "spot"

    def parse_items(payload: dict) -> list[dict]:
        resp = payload.get("response") or {}
        body = resp.get("body") or {}
        items = body.get("items") or {}
        item = items.get("item")
        if item is None:
            return []
        if isinstance(item, list):
            return item
        return [item]

    client = TourApiClient()
    page_no = 1
    while True:
        data = await client.area_based_list(area_code=settings.tourapi_area_code, page_no=page_no, num_of_rows=200)
        items = parse_items(data)
        if not items:
            break
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
        await db.commit()
        page_no += 1
        if page_no > 50:
            break


@router.post("/import-daejeon-festivals", status_code=status.HTTP_204_NO_CONTENT)
async def import_daejeon_festivals(db: AsyncSession = Depends(get_db)) -> None:
    if settings.env != "dev":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="not_found")
    if not (settings.daejeon_api_base_url and settings.daejeon_api_path and settings.daejeon_service_key):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="daejeon_openapi_not_configured")

    from sqlalchemy import select

    from app.models.domain import MapPlace
    from app.services.daejeon_openapi_client import DaejeonOpenApiClient

    def pick_first(d: dict, keys: list[str]):
        for k in keys:
            if k in d and d[k] not in (None, ""):
                return d[k]
        return None

    def to_float(v):
        try:
            if v is None or v == "":
                return None
            return float(v)
        except (TypeError, ValueError):
            return None

    def parse_items(payload: dict) -> list[dict]:
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

    client = DaejeonOpenApiClient()
    page_no = 1
    while True:
        data = await client.fetch(page_no=page_no, num_of_rows=200)
        items = parse_items(data)
        if not items:
            break
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
            raw_type = pick_first(it, ["type", "category", "festType", "축제구분"])
            if raw_type:
                source_ref = f"{source_ref}|type={raw_type}"

            exists = await db.scalar(select(MapPlace).where(MapPlace.source_ref == source_ref))
            if exists:
                continue

            address = pick_first(it, ["addr", "address", "placeAddr", "addr1", "장소", "주소"])
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
        await db.commit()
        page_no += 1
        if page_no > 50:
            break

