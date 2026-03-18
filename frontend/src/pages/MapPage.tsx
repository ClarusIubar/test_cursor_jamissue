import { Link } from 'react-router-dom'
import { ApiError, apiFetch, setAccessToken } from '../api/client'
import MainMap from '../components/map/MainMap'
import { useAuth } from '../hooks/useAuth'

export default function MapPage() {
  const auth = useAuth()

  return (
    <>
      <div
        style={{
          position: 'fixed',
          right: 12,
          top: 12,
          zIndex: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(0,0,0,0.06)',
          padding: '10px 12px',
          borderRadius: 999,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Link to="/me" style={{ fontWeight: 800 }}>
          마이페이지
        </Link>
        {auth.state.status === 'authenticated' ? (
          <button onClick={auth.logout}>로그아웃</button>
        ) : (
          <>
            <button onClick={auth.startNaverLogin}>네이버 로그인</button>
            <button
              onClick={async () => {
                try {
                  const resp = await apiFetch<{ access_token: string }>('/dev/login', { method: 'POST' })
                  setAccessToken(resp.access_token)
                  await auth.refreshMe()
                } catch (e) {
                  const msg = e instanceof ApiError ? e.message : 'dev 로그인 실패'
                  alert(msg)
                }
              }}
            >
              dev 로그인
            </button>
            <button
              onClick={async () => {
                try {
                  await apiFetch<void>('/dev/seed-places', { method: 'POST' })
                  window.location.reload()
                } catch (e) {
                  const msg = e instanceof ApiError ? e.message : 'seed 실패'
                  alert(msg)
                }
              }}
            >
              seed
            </button>
            <button
              onClick={async () => {
                try {
                  await apiFetch<void>('/dev/import-tourapi', { method: 'POST' })
                  window.location.reload()
                } catch (e) {
                  const msg = e instanceof ApiError ? e.message : 'tourapi import 실패'
                  alert(msg)
                }
              }}
            >
              TourAPI
            </button>
            <button
              onClick={async () => {
                try {
                  await apiFetch<void>('/dev/import-daejeon-festivals', { method: 'POST' })
                  window.location.reload()
                } catch (e) {
                  const msg = e instanceof ApiError ? e.message : '대전 축제 import 실패'
                  alert(msg)
                }
              }}
            >
              대전축제
            </button>
          </>
        )}
      </div>
      <MainMap />
      {!import.meta.env.VITE_KAKAO_MAP_KEY ? (
        <div
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 30,
            padding: 12,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontWeight: 900 }}>카카오 지도 키가 없어요</div>
          <div style={{ opacity: 0.7, marginTop: 6 }}>
            `frontend/.env`에 <code>VITE_KAKAO_MAP_KEY</code>를 넣으면 지도/빵마커가 동작합니다.
          </div>
        </div>
      ) : null}
    </>
  )
}

