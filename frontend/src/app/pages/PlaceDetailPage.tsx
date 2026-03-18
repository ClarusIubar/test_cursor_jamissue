import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { mockPlaces, categoryInfo } from '../data/mockPlaces'
import { ArrowLeft, MapPin, Heart, Share2, MessageCircle } from 'lucide-react'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'

export function PlaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const place = mockPlaces.find(p => p.id === id)

  if (!place) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">장소를 찾을 수 없어요</p>
      </div>
    )
  }

  const categoryData = categoryInfo[place.category]

  // 모의 후기 데이터
  const mockReviews = [
    {
      id: '1',
      userName: '핑크공주',
      userAvatar: '👸',
      rating: 5,
      comment: '정말 예쁘고 맛있어요! 사진 찍기 좋은 곳이에요 💕',
      imageUrl: place.imageUrl,
      date: '2일 전',
    },
    {
      id: '2',
      userName: '여행러버',
      userAvatar: '✈️',
      rating: 5,
      comment: '대전 오면 꼭 가야하는 곳! 강추합니다',
      date: '1주 전',
    },
  ]

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
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* 액션 버튼들 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
              }`}
            />
          </button>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* 카테고리 뱃지 */}
        <div
          className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5"
          style={{ backgroundColor: `${categoryData.color}DD` }}
        >
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
            <p className="text-[11px] text-muted-foreground mb-3">
              {place.description}
            </p>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag, index) => (
                <span
                  key={index}
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
                <span className="text-[10px] text-muted-foreground">({mockReviews.length})</span>
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-[10px] font-medium active:scale-95 transition-transform"
              >
                후기 작성
              </button>
            </div>

            {/* 후기 작성 폼 */}
            {showReviewForm && (
              <div className="mb-4 p-3 bg-accent rounded-2xl border border-primary/20">
                <p className="text-[10px] text-muted-foreground mb-2">
                  💡 로그인하면 후기를 작성할 수 있어요
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-[11px] font-medium active:scale-95 transition-transform"
                >
                  로그인하기
                </button>
              </div>
            )}

            {/* 후기 목록 */}
            <div className="space-y-3">
              {mockReviews.map(review => (
                <div key={review.id} className="p-3 bg-card rounded-2xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs">
                      {review.userAvatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium">{review.userName}</p>
                      <p className="text-[9px] text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-xs text-primary">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground mb-2">{review.comment}</p>
                  {review.imageUrl && (
                    <div className="w-full h-24 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="p-4 bg-card border-t border-border">
        <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-medium active:scale-[0.98] transition-transform shadow-lg">
          스탬프 찍기 🍞
        </button>
      </div>
    </div>
  )
}
