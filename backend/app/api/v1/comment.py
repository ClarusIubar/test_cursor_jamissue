from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user_id
from app.db.session import get_db
from app.models.domain import Comment


router = APIRouter(prefix="/comments", tags=["comment"])


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    comment = await db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="comment_not_found")
    if str(comment.user_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
    await db.delete(comment)
    await db.commit()

