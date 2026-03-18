import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import ToastPopup from '../common/ToastPopup'
import { latLngOf, loadKakaoMaps } from './kakao'
import './MainMap.css'

type Place = {
  id: string
  title: string
  category: string
  lat: number
  lng: number
  address?: string | null
}

const JAM_COLORS: Record<string, string> = {
  food: '#FF4D7D',
  spot: '#7C4DFF',
  cafe: '#FFB020',
  culture: '#2DD4BF',
  default: '#94A3B8',
}

function jamColorOf(category: string) {
  return JAM_COLORS[category] ?? JAM_COLORS.default
}

function breadMarkerSvg(color: string) {
  const svg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <path d="M18 26c0-8 6-14 14-14s14 6 14 14v18c0 4-3 8-8 8H26c-5 0-8-4-8-8V26z" fill="#FFF7ED" stroke="rgba(0,0,0,0.12)" stroke-width="2" />
    <path d="M22 24c0-6 4-10 10-10s10 4 10 10" fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="2" />
    <circle cx="26" cy="34" r="3" fill="${color}" opacity="0.9"/>
    <circle cx="38" cy="38" r="3" fill="${color}" opacity="0.65"/>
  </svg>
  `)
  return `data:image/svg+xml;charset=utf-8,${svg}`
}

export default function MainMap() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const kakaoRef = useRef<any>(null)
  const mapObjRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const navigate = useNavigate()

  const [places, setPlaces] = useState<Place[]>([])
  const [category, setCategory] = useState<string>('all')
  const [selected, setSelected] = useState<Place | null>(null)
  const [tap, setTap] = useState<{ id: string; ts: number } | null>(null)

  const filtered = useMemo(() => {
    if (category === 'all') return places
    return places.filter((p) => p.category === category)
  }, [places, category])

  useEffect(() => {
    ;(async () => {
      const resp = await apiFetch<{ items: Place[] }>('/map/places', { method: 'GET' })
      setPlaces(resp.items)
    })()
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    let mounted = true
    ;(async () => {
      const kakao = await loadKakaoMaps()
      if (!mounted) return
      kakaoRef.current = kakao
      const center = latLngOf(kakao, 36.3504, 127.3845)
      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 6,
      })
      mapObjRef.current = map
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const kakao = kakaoRef.current
    const map = mapObjRef.current
    if (!kakao || !map) return

    for (const m of markersRef.current) m.setMap(null)
    markersRef.current = []

    for (const p of filtered) {
      const icon = new kakao.maps.MarkerImage(
        breadMarkerSvg(jamColorOf(p.category)),
        new kakao.maps.Size(48, 48),
        { offset: new kakao.maps.Point(24, 42) },
      )
      const marker = new kakao.maps.Marker({
        map,
        position: latLngOf(kakao, p.lat, p.lng),
        image: icon,
        clickable: true,
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        const now = Date.now()
        const prev = tap && tap.id === p.id ? tap : null
        setTap({ id: p.id, ts: now })

        if (prev && now - prev.ts < 320) {
          navigate(`/feed/${p.id}`)
          return
        }

        setSelected(p)
      })

      markersRef.current.push(marker)
    }
  }, [filtered, navigate, tap])

  return (
    <div className="mapShell">
      <div className="topBar" onTouchMove={(e) => e.preventDefault()}>
        <div className="brand">잼있슈</div>
        <div className="filters">
          {[
            { id: 'all', label: '전체', color: '#111827' },
            { id: 'food', label: '맛집', color: JAM_COLORS.food },
            { id: 'spot', label: '명소', color: JAM_COLORS.spot },
            { id: 'cafe', label: '카페', color: JAM_COLORS.cafe },
            { id: 'culture', label: '문화', color: JAM_COLORS.culture },
          ].map((f) => (
            <button
              key={f.id}
              className={`filterChip ${category === f.id ? 'active' : ''}`}
              style={{ borderColor: f.color }}
              onClick={() => setCategory(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mapCanvas"
        ref={mapRef}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault()}
      />

      <ToastPopup
        open={!!selected}
        title={selected?.title ?? ''}
        subtitle={selected?.address ?? undefined}
        jamColor={selected ? jamColorOf(selected.category) : JAM_COLORS.default}
        onClose={() => setSelected(null)}
        onOpenDetail={() => selected && navigate(`/feed/${selected.id}`)}
      />
    </div>
  )
}

