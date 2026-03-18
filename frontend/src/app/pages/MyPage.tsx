import { useState } from 'react'
import { useNavigate } from 'react-router'
import { User, Award, MapPin, Settings, LogIn } from 'lucide-react'

export function MyPage() {
  const navigate = useNavigate()

  // 로그인 상태 (임시로 false)
  const isLoggedIn = false
  const userName = '핑크공주'
  const [activeTab, setActiveTab] = useState<'stamps' | 'activity'>('stamps')

  // 모의 스탬프 데이터
  const stamps = [
    { id: '1', placeName: '성심당', completed: true, icon: '🍞' },
    { id: '2', placeName: '대청호', completed: true, icon: '🌸' },
    { id: '3', placeName: '카페 온리', completed: true, icon: '☕' },
    { id: '4', placeName: '엑스포', completed: false, icon: '🎨' },
    { id: '5', placeName: '은행동', completed: false, icon: '☕' },
    { id: '6', placeName: '한밭수목원', completed: false, icon: '🌸' },
  ]

  const completedCount = stamps.filter(s => s.completed).length
  const progress = (completedCount / stamps.length) * 100

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2">로그인이 필요해요</h2>
        <p className="text-[11px] text-muted-foreground text-center mb-6">
          스탬프를 모으고 후기를 남기려면<br />로그인이 필요합니다
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-[12px]">로그인하기</span>
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* 프로필 헤더 */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-destructive p-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
              👸
            </div>
            <div>
              <h2 className="text-white">{userName}</h2>
              <p className="text-[10px] text-white/80">잼 콜렉터</p>
            </div>
          </div>
          <button className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 탭 */}
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

      {activeTab === 'stamps' ? (
        <>
          <div className="px-4 mb-6">
            <div className="bg-card rounded-3xl shadow-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-[13px] font-medium">스탬프 현황</h3>
                </div>
                <span className="text-[11px] text-primary font-medium">
                  {completedCount}/{stamps.length}
                </span>
              </div>

              {/* 프로그레스 바 */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-destructive rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 스탬프 그리드 */}
              <div className="grid grid-cols-6 gap-2">
                {stamps.map(stamp => (
                  <div
                    key={stamp.id}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-xl transition-all ${
                      stamp.completed
                        ? 'bg-gradient-to-br from-primary/20 to-destructive/20 scale-100'
                        : 'bg-muted scale-95 grayscale opacity-50'
                    }`}
                  >
                    {stamp.icon}
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                {stamps.length - completedCount}개의 장소를 더 방문해보세요!
              </p>
            </div>
          </div>

          <div className="px-4 pb-20">
            <h3 className="text-[13px] font-medium mb-3">최근 방문</h3>
            <div className="space-y-2">
              {stamps
                .filter(s => s.completed)
                .map(stamp => (
                  <div
                    key={stamp.id}
                    className="bg-card rounded-2xl p-3 border border-border flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-xl">
                      {stamp.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium">{stamp.placeName}</p>
                      <p className="text-[10px] text-muted-foreground">방문 완료</p>
                    </div>
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 pb-20">
          <h3 className="text-[13px] font-medium mb-3">내 활동</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">방문한 곳</p>
              <p className="font-medium">{completedCount}곳</p>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-2">
                <span className="text-lg">💬</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-1">작성한 후기</p>
              <p className="font-medium">2개</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
