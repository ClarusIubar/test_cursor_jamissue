import { useAuth } from '../hooks/useAuth'

export default function MyPage() {
  const auth = useAuth()

  if (auth.state.status === 'loading') return <div style={{ padding: 16 }}>불러오는 중…</div>

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>마이페이지</div>
      {auth.state.status === 'authenticated' ? (
        <>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 800 }}>{auth.state.user.nickname ?? '이름 없는 식빵'}</div>
            <div style={{ opacity: 0.7, marginTop: 4 }}>user_id: {auth.state.user.id}</div>
          </div>
          <button style={{ marginTop: 14 }} onClick={auth.logout}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <div style={{ marginTop: 10, opacity: 0.7 }}>로그인이 필요해요.</div>
          <button style={{ marginTop: 14 }} onClick={auth.startNaverLogin}>
            네이버로 로그인
          </button>
        </>
      )}
    </div>
  )
}

