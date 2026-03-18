import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch, getAccessToken, getApiBaseUrl, setAccessToken } from '../api/client'

export type UserPublic = {
  id: string
  naver_id: string
  nickname?: string | null
  profile_image_url?: string | null
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
  user: UserPublic
}

type AuthState =
  | { status: 'anonymous' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserPublic }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  const refreshMe = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setState({ status: 'anonymous' })
      return
    }
    try {
      const me = await apiFetch<UserPublic>('/auth/me', { method: 'GET', auth: true })
      setState({ status: 'authenticated', user: me })
    } catch {
      setAccessToken(null)
      setState({ status: 'anonymous' })
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const startNaverLogin = useCallback(async () => {
    try {
      const { auth_url, state_token } = await apiFetch<{ auth_url: string; state_token: string }>(
        '/auth/naver/login',
        { method: 'GET' },
      )
      sessionStorage.setItem('jamissyu_oauth_state_token', state_token)
      window.location.assign(auth_url)
      return
    } catch {
      // Worker-first/JamIssue backend compatibility:
      // some backends return redirect directly instead of JSON payload.
      window.location.assign(`${getApiBaseUrl()}/auth/naver/login`)
    }
  }, [])

  const finishNaverCallback = useCallback(
    async (params: { code: string; state: string }) => {
      const state_token = sessionStorage.getItem('jamissyu_oauth_state_token') ?? ''
      const tokenResp = await apiFetch<TokenResponse>('/auth/naver/callback', {
        method: 'POST',
        body: JSON.stringify({ code: params.code, state: params.state, state_token }),
      })
      setAccessToken(tokenResp.access_token)
      sessionStorage.removeItem('jamissyu_oauth_state_token')
      setState({ status: 'authenticated', user: tokenResp.user })
    },
    [],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    sessionStorage.removeItem('jamissyu_oauth_state_token')
    setState({ status: 'anonymous' })
  }, [])

  return useMemo(
    () => ({
      state,
      startNaverLogin,
      finishNaverCallback,
      refreshMe,
      logout,
    }),
    [state, startNaverLogin, finishNaverCallback, refreshMe, logout],
  )
}

