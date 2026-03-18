from __future__ import annotations

from pydantic import BaseModel, Field


class FeedCreateRequest(BaseModel):
    position_id: str
    content: str = Field(min_length=1, max_length=5000)
    image_url: str | None = None
    lat: float
    lng: float


class FeedPublic(BaseModel):
    id: str
    user_id: str
    position_id: str
    content: str
    image_url: str | None = None
    created_at: str


class FeedListResponse(BaseModel):
    items: list[FeedPublic]


class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentPublic(BaseModel):
    id: str
    feed_id: str
    user_id: str
    content: str
    created_at: str


class FeedDetailResponse(BaseModel):
    feed: FeedPublic
    comments: list[CommentPublic]

