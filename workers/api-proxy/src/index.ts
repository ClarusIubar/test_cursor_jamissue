export interface Env {
  APP_ORIGIN_API_URL?: string
  BACKEND_ORIGIN?: string
}

type SamplePlace = {
  title: string
  category: string
  lat: number
  lng: number
  address: string
  source_ref: string
}

const SAMPLE_PLACES: SamplePlace[] = [
  {
    title: '성심당 본점',
    category: 'food',
    lat: 36.328631,
    lng: 127.427432,
    address: '대전 중구 대종로480번길 15',
    source_ref: 'seed',
  },
  {
    title: '한밭수목원',
    category: 'spot',
    lat: 36.366631,
    lng: 127.388917,
    address: '대전 서구 둔산대로 169',
    source_ref: 'seed',
  },
  {
    title: '오월드',
    category: 'spot',
    lat: 36.297188,
    lng: 127.398482,
    address: '대전 중구 사정공원로 70',
    source_ref: 'seed',
  },
  {
    title: '대전근현대사전시관',
    category: 'culture',
    lat: 36.332962,
    lng: 127.434079,
    address: '대전 중구 중앙로 101',
    source_ref: 'seed',
  },
  {
    title: '카페(샘플) - 대흥동',
    category: 'cafe',
    lat: 36.3239,
    lng: 127.4297,
    address: '대전 중구 대흥동',
    source_ref: 'seed',
  },
]

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  if (!headers.has('content-type')) headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('access-control-allow-origin', '*')
  headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  headers.set('access-control-allow-headers', 'authorization,content-type')
  return new Response(JSON.stringify(data), { ...init, headers })
}

function buildTargetUrl(requestUrl: URL, backendOrigin: string) {
  const target = new URL(requestUrl.pathname + requestUrl.search, backendOrigin)
  return target
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'access-control-allow-headers': 'authorization,content-type',
        },
      })
    }

    if (requestUrl.pathname === '/healthz') {
      return json({ status: 'ok', service: 'jamissyu-worker-proxy' })
    }

    if (requestUrl.pathname === '/api/v1/dev/sample-places') {
      return json({ items: SAMPLE_PLACES })
    }

    if (requestUrl.pathname === '/api/v1/map/places') {
      const items = SAMPLE_PLACES.map((it, index) => ({
        id: `sample-${index}`,
        title: it.title,
        category: it.category,
        lat: it.lat,
        lng: it.lng,
        address: it.address,
      }))
      return json({ items })
    }

    if (requestUrl.pathname === '/api/v1/feed') {
      return json({ items: [] })
    }

    if (requestUrl.pathname === '/api/v1/dev/status') {
      return json({
        service: 'jamissyu-worker-proxy',
        env: 'worker',
        dev_auth_enabled: false,
        db_connected: false,
        db_error: 'backend_not_public',
      })
    }

    const backendOrigin = env.APP_ORIGIN_API_URL ?? env.BACKEND_ORIGIN ?? 'http://127.0.0.1:8012'
    const target = buildTargetUrl(requestUrl, backendOrigin)

    const proxiedRequest = new Request(target.toString(), request)
    let response: Response
    try {
      response = await fetch(proxiedRequest)
    } catch {
      return json(
        {
          error_code: 'BACKEND_UNREACHABLE',
          message: '백엔드 원점에 연결할 수 없어요.',
          hint: 'Workers env.APP_ORIGIN_API_URL(또는 BACKEND_ORIGIN)을 공개 URL로 설정해 주세요.',
        },
        { status: 502 },
      )
    }

    const headers = new Headers(response.headers)
    headers.set('access-control-allow-origin', '*')
    headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    headers.set('access-control-allow-headers', 'authorization,content-type')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
