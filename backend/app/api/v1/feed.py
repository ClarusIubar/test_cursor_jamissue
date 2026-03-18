from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user_id
from app.db.session import get_db
from app.models.domain import Comment, Feed, MapPlace
from app.schemas.feed import (
    CommentCreateRequest,
    CommentPublic,
    FeedCreateRequest,
    FeedDetailResponse,
    FeedListResponse,
    FeedPublic,
)
from app.services.location_service import haversine_meters


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/feed", tags=["feed"])


@router.post("", response_model=FeedPublic, status_code=status.HTTP_201_CREATED)
async def create_feed(
    body: FeedCreateRequest,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> FeedPublic:
    place = await db.get(MapPlace, body.position_id)
    if place is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="place_not_found")

    dist = haversine_meters(lat1=body.lat, lng1=body.lng, lat2=place.lat, lng2=place.lng)
    if dist > 50.0:
        logger.info(
            "stamp_rejected",
            extra={
                "user_id": user_id,
                "position_id": str(place.id),
                "meters": dist,
                "ip": request.client.host if request.client else None,
                "ua": request.headers.get("user-agent"),
            },
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="too_far")

    feed = Feed(
        user_id=uuid.UUID(user_id),
        position_id=place.id,
        content=body.content,
        image_url=body.image_url,
    )
    db.add(feed)
    await db.commit()
    await db.refresh(feed)
    return FeedPublic(
        id=str(feed.id),
        user_id=str(feed.user_id),
        position_id=str(feed.position_id),
        content=feed.content,
        image_url=feed.image_url,
        created_at=feed.created_at.isoformat(),
    )


@router.get("", response_model=FeedListResponse)
async def list_feeds(position_id: str | None = None, db: AsyncSession = Depends(get_db)) -> FeedListResponse:
    stmt = select(Feed).order_by(Feed.created_at.desc())
    if position_id:
        stmt = stmt.where(Feed.position_id == uuid.UUID(position_id))
    rows = (await db.scalars(stmt)).all()
    return FeedListResponse(
        items=[
            FeedPublic(
                id=str(f.id),
                user_id=str(f.user_id),
                position_id=str(f.position_id),
                content=f.content,
                image_url=f.image_url,
                created_at=f.created_at.isoformat(),
            )
            for f in rows
        ]
    )


@router.get("/{feed_id}", response_model=FeedDetailResponse)
async def get_feed(feed_id: str, db: AsyncSession = Depends(get_db)) -> FeedDetailResponse:
    feed = await db.get(Feed, feed_id)
    if feed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="feed_not_found")

    comments = (await db.scalars(select(Comment).where(Comment.feed_id == feed.id).order_by(Comment.created_at.asc()))).all()
    return FeedDetailResponse(
        feed=FeedPublic(
            id=str(feed.id),
            user_id=str(feed.user_id),
            position_id=str(feed.position_id),
            content=feed.content,
            image_url=feed.image_url,
            created_at=feed.created_at.isoformat(),
        ),
        comments=[
            CommentPublic(
                id=str(c.id),
                feed_id=str(c.feed_id),
                user_id=str(c.user_id),
                content=c.content,
                created_at=c.created_at.isoformat(),
            )
            for c in comments
        ],
    )


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feed(
    feed_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    feed = await db.get(Feed, feed_id)
    if feed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="feed_not_found")
    if str(feed.user_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
    await db.delete(feed)
    await db.commit()


@router.post("/{feed_id}/comments", response_model=CommentPublic)
async def add_comment(
    feed_id: str,
    body: CommentCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> CommentPublic:
    feed = await db.get(Feed, feed_id)
    if feed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="feed_not_found")
    comment = Comment(feed_id=feed.id, user_id=uuid.UUID(user_id), content=body.content)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return CommentPublic(
        id=str(comment.id),
        feed_id=str(comment.feed_id),
        user_id=str(comment.user_id),
        content=comment.content,
        created_at=comment.created_at.isoformat(),
    )

