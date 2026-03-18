type KakaoLatLng = { getLat: () => number; getLng: () => number }

declare global {
  interface Window {
    kakao?: any
  }
}

export async function loadKakaoMaps(): Promise<any> {
  if (window.kakao?.maps) return window.kakao

  const key = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined
  if (!key) throw new Error('missing_kakao_key')

  const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-maps="1"]')
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('kakao_script_failed')), { once: true })
    })
  } else {
    const script = document.createElement('script')
    script.dataset.kakaoMaps = '1'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      key,
    )}&autoload=false`
    document.head.appendChild(script)

    await new Promise<void>((resolve, reject) => {
      script.addEventListener('load', () => resolve(), { once: true })
      script.addEventListener('error', () => reject(new Error('kakao_script_failed')), { once: true })
    })
  }

  await new Promise<void>((resolve) => window.kakao.maps.load(() => resolve()))
  return window.kakao
}

export function latLngOf(kakao: any, lat: number, lng: number): KakaoLatLng {
  return new kakao.maps.LatLng(lat, lng)
}

