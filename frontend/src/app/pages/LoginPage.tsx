import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'

import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import { devLogin, setAccessToken } from '../api/client'

export function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNaverLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      await auth.startNaverLogin()
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('네이버 로그인을 시작하지 못했어요.')
      setLoading(false)
    }
  }

  const handleDevLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await devLogin()
      setAccessToken(token.access_token)
      await auth.refreshMe()
      navigate('/my', { replace: true })
    } catch (eventError) {
      if (eventError instanceof ApiError) setError(eventError.message)
      else setError('개발 로그인에 실패했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* 헤더 */}
      <div className="p-4">
        <button
          type="button"
          title="뒤로가기"
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

        <div className="w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={() => void handleNaverLogin()}
            disabled={loading}
            className="w-full py-3.5 bg-[#03C75A] text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[#03C75A] font-bold text-xs">N</span>
            </div>
            <span className="text-[12px]">네이버로 시작하기</span>
          </button>

          <button
            type="button"
            disabled
            className="w-full py-3.5 bg-[#FEE500] text-[#191919] rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg opacity-40 cursor-not-allowed"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <span className="text-[12px]">카카오는 준비 중이에요</span>
          </button>

          {import.meta.env.DEV ? (
            <button
              type="button"
              onClick={() => void handleDevLogin()}
              disabled={loading}
              className="w-full py-3 rounded-2xl border border-border bg-card text-[12px] font-medium disabled:opacity-40"
            >
              개발 로그인
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 text-[11px] text-muted-foreground underline"
        >
          둘러보기만 할래요
        </button>

        {error ? <p className="text-[10px] text-destructive mt-3 text-center">{error}</p> : null}
      </div>

      <div className="p-4 text-center">
        <p className="text-[9px] text-muted-foreground">
          로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
