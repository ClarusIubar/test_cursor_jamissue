import type { Place } from '../../data/mockPlaces'
import { categoryInfo } from '../../data/mockPlaces'
import { ChevronRight } from 'lucide-react'
import { ImageWithFallback } from '../figma/ImageWithFallback'

const badgeClassName: Record<Place['category'], string> = {
  restaurant: 'bg-rose-400/80',
  cafe: 'bg-sky-400/80',
  attraction: 'bg-pink-300/80',
  culture: 'bg-cyan-300/80',
}

interface PlaceCardProps {
  place: Place
  onClick: () => void
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  const categoryData = categoryInfo[place.category]

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all active:scale-[0.98] flex flex-col"
    >
      {/* 이미지 영역 */}
      <div className="relative h-32 overflow-hidden">
        <ImageWithFallback
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />

        {/* 카테고리 뱃지 */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 ${badgeClassName[place.category]}`}>
          <span className="text-xs">{categoryData.icon}</span>
          <span className="text-[8px] text-white font-medium">{categoryData.name}</span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-foreground text-left">{place.name}</h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>

        <p className="text-[11px] text-muted-foreground text-left line-clamp-2 mb-2">
          {place.description}
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {place.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-accent rounded-full text-[9px] text-accent-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
