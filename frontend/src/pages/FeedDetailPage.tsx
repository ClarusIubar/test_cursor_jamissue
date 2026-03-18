import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../api/client'
import { useAuth } from '../hooks/useAuth'

type FeedPublic = {
  id: string
  user_id: string
  position_id: string
  content: string
  image_url?: string | null
  created_at: string
}

type CommentPublic = {
  id: string
  feed_id: string
  user_id: string
  content: string
  created_at: string
}

type FeedDetailResponse = { feed: FeedPublic; comments: CommentPublic[] }

export default function FeedDetailPage() {
  const { placeId } = useParams<{ placeId: string }>()
  const navigate = useNavigate()
  const auth = useAuth()

  const [feeds, setFeeds] = useState<FeedPublic[]>([])
  const [selectedFeed, setSelectedFeed] = useState<FeedDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canWrite = auth.state.status === 'authenticated'

  useEffect(() => {
    if (!placeId) return
    ;(async () => {
      try {
        const resp = await apiFetch<{ items: FeedPublic[] }>(`/feed?position_id=${encodeURIComponent(placeId)}`, {
          method: 'GET',
        })
        setFeeds(resp.items)
      } catch (e) {
        if (e instanceof ApiError) setError(e.payload?.message ?? e.message)
        else setError('식빵이 탔어요! 잠시 후 다시 시도해 주세요.')
      }
    })()
  }, [placeId])

  const firstFeedId = useMemo(() => feeds[0]?.id ?? null, [feeds])

  useEffect(() => {
    if (!firstFeedId) return
    ;(async () => {
      try {
        const detail = await apiFetch<FeedDetailResponse>(`/feed/${firstFeedId}`, { method: 'GET' })
        setSelectedFeed(detail)
      } catch {
        // ignore
      }
    })()
  }, [firstFeedId])

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => navigate(-1)}>←</button>
        <div style={{ fontWeight: 900 }}>피드</div>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/me">마이페이지</Link>
        </div>
      </div>

      {error ? <div style={{ marginTop: 12, color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}

      <div style={{ marginTop: 14, opacity: 0.7 }}>
        place_id: <code>{placeId}</code>
      </div>

      <div style={{ marginTop: 14, fontWeight: 800 }}>최근 피드 목록</div>
      <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
        {feeds.length === 0 ? <div style={{ opacity: 0.7 }}>아직 피드가 없어요.</div> : null}
        {feeds.map((f) => (
          <button
            key={f.id}
            style={{ textAlign: 'left', padding: 12, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}
            onClick={async () => setSelectedFeed(await apiFetch<FeedDetailResponse>(`/feed/${f.id}`, { method: 'GET' }))}
          >
            <div style={{ fontWeight: 800, lineHeight: 1.3 }}>{f.content.slice(0, 80)}</div>
            <div style={{ opacity: 0.6, marginTop: 6, fontSize: '0.9rem' }}>{new Date(f.created_at).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 900 }}>선택된 피드</div>
        {selectedFeed ? (
          <>
            <div style={{ marginTop: 8, padding: 12, borderRadius: 14, background: 'rgba(17,24,39,0.04)' }}>
              <div style={{ fontWeight: 800 }}>{selectedFeed.feed.content}</div>
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: '0.9rem' }}>
                {new Date(selectedFeed.feed.created_at).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: 12, fontWeight: 800 }}>댓글</div>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {selectedFeed.comments.map((c) => (
                <div key={c.id} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700 }}>{c.content}</div>
                  <div style={{ opacity: 0.6, marginTop: 4, fontSize: '0.85rem' }}>
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {selectedFeed.comments.length === 0 ? <div style={{ opacity: 0.7 }}>댓글이 없어요.</div> : null}
            </div>
          </>
        ) : (
          <div style={{ marginTop: 8, opacity: 0.7 }}>선택된 피드가 없어요.</div>
        )}
      </div>

      <div style={{ marginTop: 18, padding: 12, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 800 }}>피드 작성(로그인 + 50m 필요)</div>
        <div style={{ opacity: 0.7, marginTop: 6, fontSize: '0.92rem' }}>
          MVP에서는 UI 입력 최소화 원칙에 따라, 데모용으로 고정 메시지를 전송합니다.
        </div>
        <button
          disabled={!canWrite}
          style={{ marginTop: 10 }}
          onClick={async () => {
            if (!placeId) return
            try {
              const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 }),
              )
              await apiFetch<FeedPublic>('/feed', {
                method: 'POST',
                auth: true,
                body: JSON.stringify({
                  position_id: placeId,
                  content: '방금 여기 찍었슈!',
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              })
              const resp = await apiFetch<{ items: FeedPublic[] }>(`/feed?position_id=${encodeURIComponent(placeId)}`, {
                method: 'GET',
              })
              setFeeds(resp.items)
            } catch (e) {
              if (e instanceof ApiError) setError(e.payload?.message ?? e.message)
              else setError('식빵이 탔어요! 잠시 후 다시 시도해 주세요.')
            }
          }}
        >
          지금 위치로 피드 남기기
        </button>
        {!canWrite ? <div style={{ marginTop: 8, opacity: 0.7 }}>로그인 후 사용 가능해요.</div> : null}
      </div>
    </div>
  )
}

