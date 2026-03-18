export interface Env {
  APP_FRONTEND_URL?: string
  APP_ORIGIN_API_URL?: string
  APP_SUPABASE_SERVICE_ROLE_KEY?: string
  APP_SUPABASE_URL?: string
  BACKEND_ORIGIN?: string
  NAVER_CLIENT_ID?: string
  NAVER_CLIENT_SECRET?: string
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

function rewritePathForOrigin(pathname: string): string {
  if (pathname.startsWith('/api/v1/auth/')) {
    return pathname.replace('/api/v1/auth/', '/api/auth/')
  }
  return pathname
}

function rewriteAuthRedirectLocation(
  originLocation: string,
  frontendUrl: string,
): string {
  try {
    const from = new URL(originLocation)
    const to = new URL(frontendUrl)
    if (from.hostname === 'jamissue.growgardens.app') {
      from.protocol = to.protocol
      from.host = to.host
      return from.toString()
    }
  } catch {
    // no-op
  }
  return originLocation
}

function rewriteNaverAuthorizeLocation(
  originLocation: string,
  frontendUrl: string,
): string {
  try {
    const url = new URL(originLocation)
    if (url.hostname !== 'nid.naver.com') return originLocation

    const frontendCallback = `${frontendUrl}/api/v1/auth/naver/callback`
    url.searchParams.set('redirect_uri', frontendCallback)
    return url.toString()
  } catch {
    return originLocation
  }
}

function resolveBackendOrigin(env: Env): string | null {
  const candidate = env.APP_ORIGIN_API_URL?.trim() || env.BACKEND_ORIGIN?.trim() || ''
  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    if (!parsed.protocol.startsWith('http')) return null
    return parsed.origin
  } catch {
    return null
  }
}

function getSupabaseConfig(env: Env) {
  const url = env.APP_SUPABASE_URL?.trim()
  const serviceRoleKey = env.APP_SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceRoleKey) return null
  return { url: url.replace(/\/$/, ''), serviceRoleKey }
}

async function supabaseFetch<T>(
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getSupabaseConfig(env)
  if (!config) {
    throw new Error('supabase_not_configured')
  }

  const headers = new Headers(init.headers)
  headers.set('apikey', config.serviceRoleKey)
  headers.set('authorization', `Bearer ${config.serviceRoleKey}`)
  if (!headers.has('content-type')) headers.set('content-type', 'application/json')

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`supabase_error:${response.status}:${detail}`)
  }

  return (await response.json()) as T
}

function notFound() {
  return json(
    {
      error_code: 'BREAD_NOT_FOUND',
      message: '식빵이 길을 잃었어요!',
      hint: 'endpoint를 확인해 주세요',
    },
    { status: 404 },
  )
}

function buildNaverLoginUrl(env: Env): string {
  const clientId = env.NAVER_CLIENT_ID || 'tfWW1wQ5XJRS7XKJbwzY'
  const redirectUri = encodeURIComponent('https://jamit.growgardens.app/api/v1/auth/naver/callback')
  const state = Math.random().toString(36).substring(7)
  
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
}

async function handleNaverLogin(env: Env): Promise<Response> {
  const authUrl = buildNaverLoginUrl(env)
  
  return json({
    auth_url: authUrl,
    state_token: '',
  })
}

async function handleNaverCallback(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error_code: 'METHOD_NOT_ALLOWED' }, { status: 405 })
  }

  try {
    const body = await request.json() as { code?: string; state?: string; state_token?: string }
    
    if (!body.code) {
      return json({ error_code: 'MISSING_CODE', message: '인증 코드가 없습니다' }, { status: 400 })
    }

    const redirectUri = `${new URL(request.url).origin}/api/v1/auth/naver/callback`
    const clientId = env.NAVER_CLIENT_ID || 'tfWW1wQ5XJRS7XKJbwzY'
    const clientSecret = env.NAVER_CLIENT_SECRET || ''

    if (!clientSecret) {
      return json(
        { error_code: 'NAVER_NOT_CONFIGURED', message: 'Naver 설정이 없습니다' },
        { status: 500 },
      )
    }

    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: body.code,
        state: body.state || '',
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return json(
        { error_code: 'NAVER_TOKEN_ERROR', message: error },
        { status: 401 },
      )
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string }
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return json(
        { error_code: 'NO_ACCESS_TOKEN', message: 'Naver에서 토큰을 받지 못했습니다' },
        { status: 401 },
      )
    }

    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileResponse.ok) {
      return json(
        { error_code: 'NAVER_PROFILE_ERROR', message: '프로필 조회 실패' },
        { status: 401 },
      )
    }

    const profileData = (await profileResponse.json()) as { response?: { id?: string; nickname?: string; profile_image?: string } }
    const profile = profileData.response || {}
    const naverId = profile.id || ''

    if (!naverId) {
      return json(
        { error_code: 'NAVER_NO_ID', message: 'Naver ID를 받지 못했습니다' },
        { status: 401 },
      )
    }

    const mockUser = {
      id: `naver_${naverId}`,
      naver_id: naverId,
      nickname: profile.nickname || 'User',
      profile_image_url: profile.profile_image,
    }

    return json({
      access_token: accessToken,
      user: mockUser,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : '알 수 없는 오류'
    return json(
      { error_code: 'CALLBACK_ERROR', message: msg },
      { status: 500 },
    )
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url)
    const path = requestUrl.pathname
    const method = request.method
    const segments = path.split('/').filter(Boolean)

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

    if (path === '/healthz') {
      return json({ status: 'ok', service: 'jamissyu-worker-proxy' })
    }

    if (path === '/api/v1/auth/naver/login' && method === 'GET') {
      return handleNaverLogin(env)
    }

    if (path === '/api/v1/auth/naver/callback' && method === 'POST') {
      return handleNaverCallback(request, env)
    }

    if (path === '/api/v1/dev/sample-places') {
      return json({ items: SAMPLE_PLACES })
    }

    if (path === '/api/v1/map/places' && method === 'GET') {
      try {
        const items = await supabaseFetch<
          Array<{
            id: string
            title: string
            category: string
            lat: number
            lng: number
            address: string | null
          }>
        >(env, 'map?select=id,title,category,lat,lng,address&order=created_at.desc')
        return json({ items })
      } catch {
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
    }

    if (path === '/api/v1/feed' && method === 'GET') {
      try {
        const positionId = requestUrl.searchParams.get('position_id')
        const params = [
          'select=id,user_id,position_id,content,image_url,created_at',
          'order=created_at.desc',
        ]
        if (positionId) params.push(`position_id=eq.${encodeURIComponent(positionId)}`)

        const items = await supabaseFetch<
          Array<{
            id: string
            user_id: string
            position_id: string
            content: string
            image_url: string | null
            created_at: string
          }>
        >(env, `feed?${params.join('&')}`)

        return json({ items })
      } catch {
        return json({ items: [] })
      }
    }

    if (segments.length === 4 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'feed' && method === 'GET') {
      const feedId = segments[3]
      try {
        const feeds = await supabaseFetch<
          Array<{
            id: string
            user_id: string
            position_id: string
            content: string
            image_url: string | null
            created_at: string
          }>
        >(
          env,
          `feed?select=id,user_id,position_id,content,image_url,created_at&id=eq.${encodeURIComponent(feedId)}&limit=1`,
        )

        const feed = feeds[0]
        if (!feed) return notFound()

        const comments = await supabaseFetch<
          Array<{
            id: string
            feed_id: string
            user_id: string
            content: string
            created_at: string
          }>
        >(
          env,
          `comment?select=id,feed_id,user_id,content,created_at&feed_id=eq.${encodeURIComponent(feedId)}&order=created_at.asc`,
        )

        return json({ feed, comments })
      } catch {
        return notFound()
      }
    }

    if (path === '/api/v1/dev/status') {
      const supabaseConfigured = Boolean(getSupabaseConfig(env))
      if (supabaseConfigured) {
        try {
          await supabaseFetch<Array<{ id: string }>>(env, 'map?select=id&limit=1')
          return json({
            service: 'jamissyu-worker-proxy',
            env: 'worker',
            supabase_configured: true,
            db_connected: true,
            db_error: null,
          })
        } catch {
          return json({
            service: 'jamissyu-worker-proxy',
            env: 'worker',
            supabase_configured: true,
            db_connected: false,
            db_error: 'supabase_unreachable_or_schema_mismatch',
          })
        }
      }

      return json({
        service: 'jamissyu-worker-proxy',
        env: 'worker',
        supabase_configured: false,
        dev_auth_enabled: false,
        db_connected: false,
        db_error: 'backend_not_public',
      })
    }

    const backendOrigin = resolveBackendOrigin(env)

    if (!backendOrigin) {
      return json(
        {
          error_code: 'BACKEND_ORIGIN_NOT_SET',
          message: '백엔드 원점 URL이 설정되지 않았어요.',
          hint: 'APP_ORIGIN_API_URL(또는 BACKEND_ORIGIN)에 https://... 형식의 URL을 입력해 주세요.',
        },
        { status: 503 },
      )
    }

    const target = buildTargetUrl(
      new URL(`${rewritePathForOrigin(requestUrl.pathname)}${requestUrl.search}`, requestUrl.origin),
      backendOrigin,
    )

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

    const rewrittenPath = rewritePathForOrigin(requestUrl.pathname)
    if (rewrittenPath.startsWith('/api/auth/')) {
      const location = headers.get('location')
      if (location) {
        let nextLocation = location

        if (rewrittenPath === '/api/auth/naver/login') {
          nextLocation = rewriteNaverAuthorizeLocation(
            nextLocation,
            env.APP_FRONTEND_URL ?? 'https://jamit.growgardens.app',
          )
        }

        nextLocation = rewriteAuthRedirectLocation(
          nextLocation,
          env.APP_FRONTEND_URL ?? 'https://jamit.growgardens.app',
        )

        headers.set('location', nextLocation)
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
