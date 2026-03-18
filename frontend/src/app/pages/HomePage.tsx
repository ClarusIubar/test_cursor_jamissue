import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { List, Map, Sparkles } from 'lucide-react'

import { BottomSheet } from '../components/common/BottomSheet'
import { CategoryFilter } from '../components/category/CategoryFilter'
import { MapView } from '../components/map/MapView'
import { PlaceCard } from '../components/place/PlaceCard'
import { getPlaces, listFeeds, type FeedPublic } from '../api/client'
import type { Place } from '../data/mockPlaces'

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

export function HomePage() {
  const navigate = useNavigate()
  const [places, setPlaces] = useState<Place[]>([])
  const [feeds, setFeeds] = useState<FeedPublic[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [openSheet, setOpenSheet] = useState<'feed' | 'recommend' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [placeItems, feedItems] = await Promise.all([getPlaces(), listFeeds()])
        setPlaces(placeItems)
        setFeeds(feedItems)
      } catch {
        setError('데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      }
    })()
  }, [])

  const filteredPlaces = useMemo(
    () => (selectedCategory ? places.filter(place => place.category === selectedCategory) : places),
    [places, selectedCategory],
  )

  const closeSheet = () => setOpenSheet(null)

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 헤더 */}
      <header className="px-4 pt-4 pb-3 bg-background border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-foreground flex items-center gap-2">
              <span className="text-2xl">🍞</span>
              <span>대전 잼있슈</span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              대전의 숨은 맛집과 명소를 찾아보세요
            </p>
          </div>

          {/* 뷰 모드 + 피드/추천 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted rounded-full p-1">
              <button
                aria-label="지도 보기"
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
              <button
                aria-label="리스트 보기"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1">
              <button
                aria-label="피드 보기"
                onClick={() => setOpenSheet('feed')}
                className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                aria-label="추천 보기"
                onClick={() => setOpenSheet('recommend')}
                className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <span className="text-sm font-medium">추천</span>
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <div className="h-full p-4">
            <MapView places={filteredPlaces} onPlaceClick={place => navigate(`/place/${place.id}`)} selectedCategory={selectedCategory} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {filteredPlaces.map(place => (
                <PlaceCard key={place.id} place={place} onClick={() => navigate(`/place/${place.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {error ? <div className="px-4 pb-2 text-[11px] text-destructive">{error}</div> : null}

      <BottomSheet
        open={openSheet !== null}
        title={openSheet === 'feed' ? '피드' : '추천'}
        onClose={closeSheet}
      >
        {openSheet === 'feed' ? (
          <div className="space-y-3">
            {feeds.length === 0 ? <div className="text-[11px] text-muted-foreground">아직 등록된 피드가 없어요.</div> : null}
            {feeds.map(feed => (
              <button
                key={feed.id}
                onClick={() => {
                  navigate(`/place/${feed.position_id}`)
                  closeSheet()
                }}
                className="w-full text-left p-3 bg-card rounded-2xl border border-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium">{shortUserId(feed.user_id)}</p>
                    <p className="text-[9px] text-muted-foreground">{formatDateLabel(feed.created_at)}</p>
                  </div>
                  <span className="text-xl">🍞</span>
                </div>
                <p className="mt-2 text-[11px] text-foreground line-clamp-3">{feed.content}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlaces.map(place => (
              <button
                key={place.id}
                onClick={() => {
                  navigate(`/place/${place.id}`)
                  closeSheet()
                }}
                className="w-full text-left p-3 bg-card rounded-2xl border border-border flex items-center justify-between"
              >
                <div>
                  <p className="text-[12px] font-medium">{place.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {place.description}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">›</span>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
