import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Award, LogIn, LogOut, MapPin, Settings, User } from 'lucide-react'

import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import {
  devLogin,
  getPlaces,
  importDaejeonFestivals,
  importTourApi,
  listFeeds,
  seedPlaces,
  setAccessToken,
} from '../api/client'

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date)
}

export function MyPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState<'stamps' | 'activity'>('stamps')
  const [placeNames, setPlaceNames] = useState<Record<string, string>>({})
  const [myFeeds, setMyFeeds] = useState<Awaited<ReturnType<typeof listFeeds>>>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth.state.status !== 'authenticated') {
      setMyFeeds([])
      return
    }

    const userId = auth.state.user.id

    ;(async () => {
      try {
        const [places, feeds] = await Promise.all([getPlaces(), listFeeds()])
        setPlaceNames(Object.fromEntries(places.map(place => [place.id, place.name])))
        setMyFeeds(feeds.filter(feed => feed.user_id === userId))
      } catch (eventError) {
        if (eventError instanceof ApiError) setError(eventError.message)
        else setError('마이페이지 정보를 불러오지 못했어요.')
      }
    })()
  }, [auth.state])

  const visitedPlaceIds = useMemo(() => Array.from(new Set(myFeeds.map(feed => feed.position_id))), [myFeeds])
  const progress = visitedPlaceIds.length === 0 ? 0 : Math.min(100, (visitedPlaceIds.length / Math.max(visitedPlaceIds.length, 6)) * 100)

  const handleDevLogin = async () => {
    try {
      setBusy(true)
      const token = await devLogin()
      setAccessToken(token.access_token)
      await auth.refreshMe()
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('개발 로그인에 실패했어요.')
    } finally {
      setBusy(false)
    }
  }

  const handleDevAction = async (action: () => Promise<void>) => {
    try {
      setBusy(true)
      setError(null)
      await action()
      window.location.reload()
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('개발용 작업 실행에 실패했어요.')
    } finally {
      setBusy(false)
    }
  }

  if (auth.state.status !== 'authenticated') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2">로그인이 필요해요</h2>
        <p className="text-[11px] text-muted-foreground text-center mb-6">스탬프를 모으고 후기를 남기려면 로그인해 주세요</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-[12px]">로그인하기</span>
        </button>
        {import.meta.env.DEV ? (
          <button
            type="button"
            onClick={() => void handleDevLogin()}
            disabled={busy}
            className="mt-3 text-[11px] text-muted-foreground underline disabled:opacity-50"
          >
            개발 로그인
          </button>
        ) : null}
        {error ? <p className="mt-3 text-[10px] text-destructive text-center">{error}</p> : null}
      </div>
    )
  }

  const user = auth.state.user

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="relative bg-gradient-to-br from-primary via-primary to-destructive p-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full overflow-hidden flex items-center justify-center text-2xl shadow-lg">
              {user.profile_image_url ? <img src={user.profile_image_url} alt={user.nickname ?? '프로필'} className="w-full h-full object-cover" /> : '🍞'}
            </div>
            <div>
              <h2 className="text-white">{user.nickname ?? '잼 유저'}</h2>
              <p className="text-[10px] text-white/80">{user.naver_id}</p>
            </div>
          </div>
          <button type="button" title="로그아웃" onClick={auth.logout} className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-8 mb-4">
        <div className="flex gap-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveTab('stamps')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'stamps'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            스탬프
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            활동
          </button>
        </div>
      </div>

      {error ? <div className="px-4 mb-4 text-[11px] text-destructive">{error}</div> : null}

      {activeTab === 'stamps' ? (
        <>
          <div className="px-4 mb-6">
            <div className="bg-card rounded-3xl shadow-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-[13px] font-medium">방문 현황</h3>
                </div>
                <span className="text-[11px] text-primary font-medium">{visitedPlaceIds.length}곳</span>
              </div>

              <div className="grid grid-cols-6 gap-1 mb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 rounded-full ${
                      index < Math.round(progress / (100 / 6))
                        ? 'bg-gradient-to-r from-primary to-destructive'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {visitedPlaceIds.length === 0 ? <p className="col-span-3 text-[11px] text-muted-foreground">아직 찍은 스탬프가 없어요.</p> : null}
                {visitedPlaceIds.map(placeId => (
                  <button
                    key={placeId}
                    type="button"
                    onClick={() => navigate(`/place/${placeId}`)}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-primary/20 to-destructive/20"
                  >
                    <span className="text-2xl mb-1">🍞</span>
                    <span className="text-[10px] line-clamp-2">{placeNames[placeId] ?? '대전 스팟'}</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                {visitedPlaceIds.length === 0 ? '첫 장소에서 스탬프를 찍어보세요!' : '방문 기록이 차곡차곡 쌓이고 있어요.'}
              </p>
            </div>
          </div>

          <div className="px-4 pb-20">
            <h3 className="text-[13px] font-medium mb-3">최근 방문</h3>
            <div className="space-y-2">
              {myFeeds.slice(0, 5).map(feed => (
                <button
                  key={feed.id}
                  type="button"
                  onClick={() => navigate(`/place/${feed.position_id}`)}
                  className="w-full bg-card rounded-2xl p-3 border border-border flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-xl">🍞</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{placeNames[feed.position_id] ?? '방문 장소'}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateLabel(feed.created_at)}</p>
                  </div>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 pb-20 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">방문한 곳</p>
              <p className="font-medium">{visitedPlaceIds.length}곳</p>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-2">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">작성한 피드</p>
              <p className="font-medium">{myFeeds.length}개</p>
            </div>
          </div>

          <div className="space-y-2">
            {myFeeds.length === 0 ? <div className="text-[11px] text-muted-foreground">아직 작성한 피드가 없어요.</div> : null}
            {myFeeds.map(feed => (
              <button
                key={feed.id}
                type="button"
                onClick={() => navigate(`/place/${feed.position_id}`)}
                className="w-full bg-card rounded-2xl p-4 border border-border text-left"
              >
                <p className="text-[12px] font-medium mb-1">{placeNames[feed.position_id] ?? '방문 장소'}</p>
                <p className="text-[11px] text-muted-foreground mb-2">{formatDateLabel(feed.created_at)}</p>
                <p className="text-[12px] line-clamp-3">{feed.content}</p>
              </button>
            ))}
          </div>

          {import.meta.env.DEV ? (
            <div className="bg-card rounded-3xl border border-border p-4 space-y-3">
              <h3 className="text-[13px] font-medium">개발 도구</h3>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={busy} onClick={() => void handleDevAction(seedPlaces)} className="py-2 rounded-2xl bg-muted text-[11px] disabled:opacity-50">seed</button>
                <button type="button" disabled={busy} onClick={() => void handleDevAction(importTourApi)} className="py-2 rounded-2xl bg-muted text-[11px] disabled:opacity-50">TourAPI</button>
                <button type="button" disabled={busy} onClick={() => void handleDevAction(importDaejeonFestivals)} className="col-span-2 py-2 rounded-2xl bg-muted text-[11px] disabled:opacity-50">대전 축제 import</button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
