import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Heart, MapPin, MessageCircle, Share2, Trash2 } from 'lucide-react'

import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import {
  createComment,
  createFeed,
  deleteComment,
  deleteFeed,
  getFeedDetail,
  getPlaceById,
  listFeeds,
  type FeedDetailResponse,
  type FeedPublic,
} from '../api/client'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'
import { categoryInfo } from '../data/mockPlaces'

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function shortUserId(userId: string) {
  return `유저 ${userId.slice(0, 6)}`
}

const categoryBadgeClassName = {
  restaurant: 'bg-rose-400/90',
  cafe: 'bg-sky-400/90',
  attraction: 'bg-pink-300/90',
  culture: 'bg-teal-300/90',
} as const

export function PlaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFeedForm, setShowFeedForm] = useState(false)
  const [place, setPlace] = useState<Awaited<ReturnType<typeof getPlaceById>>>(null)
  const [feeds, setFeeds] = useState<FeedPublic[]>([])
  const [selectedFeed, setSelectedFeed] = useState<FeedDetailResponse | null>(null)
  const [feedDraft, setFeedDraft] = useState('방금 여기 찍었슈!')
  const [commentDraft, setCommentDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUserId = auth.state.status === 'authenticated' ? auth.state.user.id : null

  const reloadFeeds = async (placeId: string, feedIdToSelect?: string) => {
    const feedItems = await listFeeds(placeId)
    setFeeds(feedItems)

    const nextFeedId = feedIdToSelect ?? feedItems[0]?.id
    if (!nextFeedId) {
      setSelectedFeed(null)
      return
    }

    setSelectedFeed(await getFeedDetail(nextFeedId))
  }

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const placeItem = await getPlaceById(id)
        setPlace(placeItem)
        if (!placeItem) {
          setError('장소를 찾을 수 없어요.')
          return
        }
        await reloadFeeds(id)
      } catch (eventError) {
        if (eventError instanceof ApiError) setError(eventError.message)
        else setError('데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const categoryData = useMemo(() => (place ? categoryInfo[place.category] : null), [place])
  const isSelectedFeedMine = selectedFeed ? selectedFeed.feed.user_id === currentUserId : false

  const handleShare = async () => {
    if (!place) return
    if (navigator.share) {
      await navigator.share({ title: place.name, text: place.description, url: window.location.href })
      return
    }
    await navigator.clipboard.writeText(window.location.href)
    window.alert('링크를 복사했어요.')
  }

  const handleCreateFeed = async () => {
    if (!id) return
    if (auth.state.status !== 'authenticated') {
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 }),
      )
      const created = await createFeed({
        position_id: id,
        content: feedDraft.trim() || '방금 여기 찍었슈!',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      setShowFeedForm(false)
      setFeedDraft('방금 여기 찍었슈!')
      await reloadFeeds(id, created.id)
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('현재 위치를 확인하거나 피드를 남기는 데 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateComment = async () => {
    if (!selectedFeed) return
    if (auth.state.status !== 'authenticated') {
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await createComment(selectedFeed.feed.id, commentDraft.trim())
      setCommentDraft('')
      setSelectedFeed(await getFeedDetail(selectedFeed.feed.id))
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('댓글 등록에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFeed = async () => {
    if (!id || !selectedFeed || !window.confirm('이 피드를 삭제할까요?')) return

    try {
      setSubmitting(true)
      await deleteFeed(selectedFeed.feed.id)
      await reloadFeeds(id)
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('피드 삭제에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedFeed || !window.confirm('댓글을 삭제할까요?')) return

    try {
      setSubmitting(true)
      await deleteComment(commentId)
      setSelectedFeed(await getFeedDetail(selectedFeed.feed.id))
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('댓글 삭제에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">불러오는 중…</div>
  }

  if (!place || !categoryData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">장소를 찾을 수 없어요</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* 상단 이미지 */}
      <div className="relative h-64 flex-shrink-0">
        <ImageWithFallback
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          title="뒤로가기"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* 액션 버튼들 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            title="즐겨찾기"
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
              }`}
            />
          </button>
          <button type="button" title="공유하기" onClick={() => void handleShare()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* 카테고리 뱃지 */}
        <div className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 ${categoryBadgeClassName[place.category]}`}>
          <span className="text-base">{categoryData.icon}</span>
          <span className="text-[11px] text-white font-medium">{categoryData.name}</span>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* 제목 및 기본 정보 */}
          <div className="mb-4">
            <h1 className="mb-2">{place.name}</h1>
            <p className="text-[11px] text-muted-foreground mb-3">{place.description}</p>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-accent rounded-full text-[10px] text-accent-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="mb-6 p-3 bg-muted rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-medium">위치 정보</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              위도: {place.latitude.toFixed(4)}, 경도: {place.longitude.toFixed(4)}
            </p>
          </div>

          {/* 후기 섹션 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="text-[13px] font-medium">방문 후기</h3>
                <span className="text-[10px] text-muted-foreground">({feeds.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedForm(!showFeedForm)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-[10px] font-medium active:scale-95 transition-transform"
              >
                후기 작성
              </button>
            </div>

            {error ? <div className="mb-4 text-[11px] text-destructive">{error}</div> : null}

            {showFeedForm ? (
              auth.state.status === 'authenticated' ? (
                <div className="mb-4 p-3 bg-accent rounded-2xl border border-primary/20 space-y-3">
                  <textarea
                    value={feedDraft}
                    onChange={event => setFeedDraft(event.target.value)}
                    placeholder="이 장소에서 남기고 싶은 한마디를 적어보세요"
                    className="w-full min-h-24 rounded-xl border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    disabled={submitting || !feedDraft.trim()}
                    onClick={() => void handleCreateFeed()}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-[11px] font-medium active:scale-95 transition-transform disabled:opacity-50"
                  >
                    현재 위치로 후기 남기기
                  </button>
                  <p className="text-[10px] text-muted-foreground">피드는 현재 위치가 장소 반경 50m 안일 때만 등록돼요.</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-accent rounded-2xl border border-primary/20">
                  <p className="text-[10px] text-muted-foreground mb-2">💡 로그인하면 이 장소에 피드를 남길 수 있어요</p>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-[11px] font-medium active:scale-95 transition-transform"
                  >
                    로그인하기
                  </button>
                </div>
              )
            ) : null}

            <div className="space-y-3">
              {feeds.length === 0 ? <div className="text-[11px] text-muted-foreground">아직 남겨진 피드가 없어요.</div> : null}
              {feeds.map(feed => {
                const isActive = selectedFeed?.feed.id === feed.id
                const isMine = feed.user_id === currentUserId

                return (
                  <button
                    key={feed.id}
                    type="button"
                    onClick={async () => setSelectedFeed(await getFeedDetail(feed.id))}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-xs">🍞</div>
                      <div className="flex-1">
                        <p className="text-[11px] font-medium">{shortUserId(feed.user_id)}</p>
                        <p className="text-[9px] text-muted-foreground">{formatDateLabel(feed.created_at)}</p>
                      </div>
                      {isMine ? <span className="text-[10px] text-primary font-medium">내 피드</span> : null}
                    </div>
                    <p className="text-[11px] text-foreground">{feed.content}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedFeed ? (
            <div className="bg-card rounded-3xl border border-border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium">선택한 피드</p>
                  <p className="text-[10px] text-muted-foreground">댓글 {selectedFeed.comments.length}개</p>
                </div>
                {isSelectedFeedMine ? (
                  <button
                    type="button"
                    title="피드 삭제"
                    onClick={() => void handleDeleteFeed()}
                    className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-[12px] font-medium mb-1">{shortUserId(selectedFeed.feed.user_id)}</p>
                <p className="text-[11px] text-muted-foreground mb-2">{formatDateLabel(selectedFeed.feed.created_at)}</p>
                <p className="text-[12px]">{selectedFeed.feed.content}</p>
              </div>

              <div className="space-y-3">
                {selectedFeed.comments.length === 0 ? <div className="text-[11px] text-muted-foreground">아직 댓글이 없어요.</div> : null}
                {selectedFeed.comments.map(comment => {
                  const isMine = comment.user_id === currentUserId

                  return (
                    <div key={comment.id} className="rounded-2xl border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium">{shortUserId(comment.user_id)}</p>
                          <p className="text-[9px] text-muted-foreground">{formatDateLabel(comment.created_at)}</p>
                        </div>
                        {isMine ? (
                          <button
                            type="button"
                            title="댓글 삭제"
                            onClick={() => void handleDeleteComment(comment.id)}
                            className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[11px]">{comment.content}</p>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2">
                <textarea
                  value={commentDraft}
                  onChange={event => setCommentDraft(event.target.value)}
                  placeholder={auth.state.status === 'authenticated' ? '댓글을 남겨보세요' : '로그인하면 댓글을 남길 수 있어요'}
                  disabled={auth.state.status !== 'authenticated'}
                  className="w-full min-h-20 rounded-2xl border border-border bg-background px-3 py-2 text-[12px] outline-none focus:border-primary disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={submitting || !commentDraft.trim()}
                  onClick={() => void handleCreateComment()}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-2xl text-[11px] font-medium disabled:opacity-50"
                >
                  댓글 남기기
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 bg-card border-t border-border">
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            setShowFeedForm(true)
            void handleCreateFeed()
          }}
          className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-medium active:scale-[0.98] transition-transform shadow-lg disabled:opacity-60"
        >
          스탬프 찍기 🍞
        </button>
      </div>
    </div>
  )
}
