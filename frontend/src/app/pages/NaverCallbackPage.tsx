import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export function NaverCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')

    if (!code || !state) {
      setError('로그인 정보가 부족해요. 다시 시도해 주세요.')
      return
    }

    ;(async () => {
      try {
        await auth.finishNaverCallback({ code, state })
        navigate('/my', { replace: true })
      } catch (eventError) {
        if (eventError instanceof ApiError) setError(eventError.message)
        else setError('식빵이 탔어요! 잠시 후 다시 시도해 주세요.')
      }
    })()
  }, [auth, navigate, params])

  return (
    <div className="h-full flex items-center justify-center px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-lg">
        <div className="text-4xl mb-3">🍞</div>
        <h2 className="mb-2">네이버 로그인 처리 중</h2>
        <p className="text-[11px] text-muted-foreground">잠시만 기다려 주세요.</p>
        {error ? <p className="mt-4 text-[11px] text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}