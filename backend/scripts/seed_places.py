from __future__ import annotations

import asyncio
import json
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.domain import MapPlace


async def main() -> None:
    seed_path = Path(__file__).resolve().parents[1] / "sample_data" / "daejeon_places_seed.json"
    items = json.loads(seed_path.read_text(encoding="utf-8"))

    async with SessionLocal() as db:
        for it in items:
            existing = await db.scalar(select(MapPlace).where(MapPlace.title == it["title"]))
            if existing:
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


if __name__ == "__main__":
    asyncio.run(main())

