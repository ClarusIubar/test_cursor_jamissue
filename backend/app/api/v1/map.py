from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.domain import MapPlace
from app.schemas.map import Place, PlaceListResponse


router = APIRouter(prefix="/map", tags=["map"])


@router.get("/places", response_model=PlaceListResponse)
async def list_places(category: str | None = None, db: AsyncSession = Depends(get_db)) -> PlaceListResponse:
    stmt = select(MapPlace).order_by(MapPlace.created_at.desc())
    if category:
        stmt = stmt.where(MapPlace.category == category)
    rows = (await db.scalars(stmt)).all()
    return PlaceListResponse(
        items=[
            Place(
                id=str(p.id),
                title=p.title,
                category=p.category,
                lat=p.lat,
                lng=p.lng,
                address=p.address,
            )
            for p in rows
        ]
    )

