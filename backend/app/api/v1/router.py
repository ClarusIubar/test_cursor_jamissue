from fastapi import APIRouter

from app.api.v1 import auth, comment, dev, feed, map


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(map.router)
api_router.include_router(feed.router)
api_router.include_router(comment.router)
api_router.include_router(dev.router)

