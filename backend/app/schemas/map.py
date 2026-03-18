from __future__ import annotations

from pydantic import BaseModel


class Place(BaseModel):
    id: str
    title: str
    category: str
    lat: float
    lng: float
    address: str | None = None


class PlaceListResponse(BaseModel):
    items: list[Place]

