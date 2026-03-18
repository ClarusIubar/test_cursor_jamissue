"""init schema

Revision ID: 0001
Revises: 
Create Date: 2026-03-18

"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("naver_id", sa.String(length=64), nullable=False),
        sa.Column("nickname", sa.String(length=64), nullable=True),
        sa.Column("profile_image_url", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_users_naver_id", "users", ["naver_id"], unique=True)

    op.create_table(
        "map",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("address", sa.String(length=300), nullable=True),
        sa.Column("source_ref", sa.String(length=200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_map_category", "map", ["category"], unique=False)
    op.create_index("ix_map_lat_lng", "map", ["lat", "lng"], unique=False)

    op.create_table(
        "feed",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["position_id"], ["map.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_feed_user_id", "feed", ["user_id"], unique=False)
    op.create_index("ix_feed_position_id", "feed", ["position_id"], unique=False)
    op.create_index("ix_feed_created_at", "feed", ["created_at"], unique=False)

    op.create_table(
        "comment",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("feed_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["feed_id"], ["feed.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_comment_feed_id", "comment", ["feed_id"], unique=False)
    op.create_index("ix_comment_user_id", "comment", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_comment_user_id", table_name="comment")
    op.drop_index("ix_comment_feed_id", table_name="comment")
    op.drop_table("comment")

    op.drop_index("ix_feed_created_at", table_name="feed")
    op.drop_index("ix_feed_position_id", table_name="feed")
    op.drop_index("ix_feed_user_id", table_name="feed")
    op.drop_table("feed")

    op.drop_index("ix_map_lat_lng", table_name="map")
    op.drop_index("ix_map_category", table_name="map")
    op.drop_table("map")

    op.drop_index("ix_users_naver_id", table_name="users")
    op.drop_table("users")

