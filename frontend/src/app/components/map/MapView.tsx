import { useState } from 'react'
import type { Place } from '../../data/mockPlaces'
import { categoryInfo } from '../../data/mockPlaces'

const markerJamClassName: Record<Place['category'], string> = {
  restaurant: 'bg-rose-500',
  cafe: 'bg-sky-400',
  attraction: 'bg-pink-300',
  culture: 'bg-cyan-300',
}

const markerBreadClassName: Record<Place['category'], string> = {
  restaurant: 'bg-rose-200',
  cafe: 'bg-sky-200',
  attraction: 'bg-pink-200',
  culture: 'bg-cyan-200',
}

const legendDotClassName: Record<Place['category'], string> = {
  restaurant: 'bg-rose-300',
  cafe: 'bg-sky-300',
  attraction: 'bg-pink-200',
  culture: 'bg-cyan-200',
}

interface MapViewProps {
  places: Place[]
  onPlaceClick: (place: Place) => void
  selectedCategory: string | null
}

export function MapView({ places, onPlaceClick, selectedCategory }: MapViewProps) {
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null)

  // 필터링된 장소들
  const filteredPlaces = selectedCategory
    ? places.filter(p => p.category === selectedCategory)
    : places

  // 지도 영역의 경계 계산 (장소가 없으면 대전 중심으로 기본 위치 설정)
  const bounds = (() => {
    if (filteredPlaces.length === 0) {
      return {
        minLat: 36.3504 - 0.01,
        maxLat: 36.3504 + 0.01,
        minLng: 127.3845 - 0.01,
        maxLng: 127.3845 + 0.01,
      }
    }

    return {
      minLat: Math.min(...filteredPlaces.map(p => p.latitude)),
      maxLat: Math.max(...filteredPlaces.map(p => p.latitude)),
      minLng: Math.min(...filteredPlaces.map(p => p.longitude)),
      maxLng: Math.max(...filteredPlaces.map(p => p.longitude)),
    }
  })()

  // 좌표를 화면 위치로 변환
  const getPosition = (lat: number, lng: number) => {
    const latRange = bounds.maxLat - bounds.minLat || 0.1
    const lngRange = bounds.maxLng - bounds.minLng || 0.1

    const x = ((lng - bounds.minLng) / lngRange) * 85 + 7.5
    const y = ((bounds.maxLat - lat) / latRange) * 85 + 7.5

    return { x, y }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-accent/30 via-background to-secondary/20 rounded-3xl overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl" />
      </div>

      {/* 지도 영역 */}
      <div className="relative w-full h-full">
        {filteredPlaces.map(place => {
          const pos = getPosition(place.latitude, place.longitude)
          const categoryData = categoryInfo[place.category]
          const isHovered = hoveredPlace === place.id

          return (
            <button
              key={place.id}
              onClick={() => onPlaceClick(place)}
              onMouseEnter={() => setHoveredPlace(place.id)}
              onMouseLeave={() => setHoveredPlace(null)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 active:scale-95"
              ref={element => {
                if (!element) return
                element.style.left = `${pos.x}%`
                element.style.top = `${pos.y}%`
              }}
            >
              {/* 빵 마커 */}
              <div className="relative">
                {/* 잼 부분 */}
                <div
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-t-full transition-all duration-300 ${
                    isHovered ? 'scale-110' : ''
                  } ${markerJamClassName[place.category]}`}
                />

                {/* 빵 부분 */}
                <div
                  className={`relative w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                    isHovered ? 'shadow-xl' : ''
                  } ${markerBreadClassName[place.category]}`}
                >
                  <span className="text-xl">{categoryData.icon}</span>
                </div>

                {/* 호버 시 이름 표시 */}
                {isHovered && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card px-3 py-1.5 rounded-full shadow-lg border border-border">
                    <p className="text-[11px] font-medium text-foreground">{place.name}</p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-border">
        <div className="flex gap-3">
          {Object.entries(categoryInfo).map(([key, info]) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                selectedCategory === key ? 'bg-accent' : 'opacity-60'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${legendDotClassName[key as Place['category']]}`} />
              <span className="text-[10px]">{info.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
