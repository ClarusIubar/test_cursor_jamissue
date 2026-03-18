import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()

  const loginDisabled = true

  const handleSocialLogin = (provider: string) => {
    if (loginDisabled) return
    console.log(`${provider} 로그인`)
    setTimeout(() => {
      navigate('/')
    }, 500)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* 헤더 */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-12">
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-destructive rounded-3xl flex items-center justify-center shadow-lg rotate-12 hover:rotate-0 transition-transform duration-500">
              <span className="text-5xl -rotate-12">🍞</span>
            </div>
          </div>
          <h1 className="mb-2">대전 잼있슈</h1>
          <p className="text-[11px] text-muted-foreground">
            로그인하고 스탬프를 모아보세요
          </p>
        </div>

        {/* 로그인 버튼들 */}
        <div className="w-full max-w-sm space-y-3">
          {/* 네이버 로그인 */}
          <button
            onClick={() => handleSocialLogin('naver')}
            disabled={loginDisabled}
            className="w-full py-3.5 bg-[#03C75A] text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[#03C75A] font-bold text-xs">N</span>
            </div>
            <span className="text-[12px]">네이버로 시작하기</span>
          </button>

          {/* 카카오 로그인 */}
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loginDisabled}
            className="w-full py-3.5 bg-[#FEE500] text-[#191919] rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <span className="text-[12px]">카카오로 시작하기</span>
          </button>
        </div>

        {/* 게스트로 계속하기 */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-[11px] text-muted-foreground underline"
        >
          둘러보기만 할래요
        </button>

        {loginDisabled && (
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            (로그인을 위해서는 API 키 설정이 필요합니다.)
          </p>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="p-4 text-center">
        <p className="text-[9px] text-muted-foreground">
          로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
