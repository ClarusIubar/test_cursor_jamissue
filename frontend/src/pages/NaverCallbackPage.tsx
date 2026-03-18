import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function NaverCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) {
      setErr('로그인 정보가 부족해요. 다시 시도해 주세요.')
      return
    }
    ;(async () => {
      try {
        await auth.finishNaverCallback({ code, state })
        navigate('/', { replace: true })
      } catch (e) {
        if (e instanceof ApiError) setErr(e.payload?.message ?? e.message)
        else setErr('식빵이 탔어요! 잠시 후 다시 시도해 주세요.')
      }
    })()
  }, [auth, navigate, params])

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 900 }}>네이버 로그인 처리중…</div>
      <div style={{ opacity: 0.7, marginTop: 6 }}>잠시만 기다려 주세요.</div>
      {err ? (
        <div style={{ marginTop: 14, color: '#b91c1c', fontWeight: 700 }}>{err}</div>
      ) : null}
    </div>
  )
}

