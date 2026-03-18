import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { MapView } from '../components/map/MapView'
import { CategoryFilter } from '../components/category/CategoryFilter'
import { PlaceCard } from '../components/place/PlaceCard'
import { getPlaces } from '../api/client'
import type { Place } from '../data/mockPlaces'
import { List, Map } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  useEffect(() => {
    getPlaces().then(setPlaces)
  }, [])

  const filteredPlaces = selectedCategory
    ? places.filter(p => p.category === selectedCategory)
    : places

  const handlePlaceClick = (placeId: string) => {
    navigate(`/place/${placeId}`)
  }

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

          {/* 뷰 모드 전환 */}
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
            <MapView
              places={filteredPlaces}
              onPlaceClick={place => handlePlaceClick(place.id)}
              selectedCategory={selectedCategory}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {filteredPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={() => handlePlaceClick(place.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
