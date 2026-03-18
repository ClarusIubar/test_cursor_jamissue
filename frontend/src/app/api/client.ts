import { apiFetch } from '../../api/client'
export { ApiError, getAccessToken, setAccessToken } from '../../api/client'

import type { Place } from '../data/mockPlaces'
import { categoryInfo } from '../data/mockPlaces'

type BackendPlace = {
  id: string
  title: string
  category: string
  lat: number
  lng: number
  address?: string | null
}

type PlaceListResponse = { items: BackendPlace[] }
type SamplePlaceListResponse = {
  items: Array<{
    title: string
    category: string
    lat: number
    lng: number
    address?: string | null
  }>
}

export type FeedPublic = {
  id: string
  user_id: string
  position_id: string
  content: string
  image_url?: string | null
  created_at: string
}

export type CommentPublic = {
  id: string
  feed_id: string
  user_id: string
  content: string
  created_at: string
}

export type FeedDetailResponse = {
  feed: FeedPublic
  comments: CommentPublic[]
}

type FeedListResponse = { items: FeedPublic[] }
type TokenResponse = { access_token: string }

const PLACEHOLDER_IMAGES: Record<Place['category'], string> = {
  restaurant: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop',
  attraction: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop',
  culture: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&auto=format&fit=crop',
}

function normalizeCategory(category: string): Place['category'] {
  switch (category) {
    case 'food':
      return 'restaurant'
    case 'spot':
      return 'attraction'
    case 'cafe':
      return 'cafe'
    case 'culture':
      return 'culture'
    default:
      return 'attraction'
  }
}

function buildTags(item: BackendPlace, category: Place['category']): string[] {
  const firstWord = item.title.split(/\s+/).find(Boolean)
  const addressWord = item.address?.split(/\s+/).find(Boolean)
  return Array.from(
    new Set([categoryInfo[category].name, firstWord, addressWord].filter((value): value is string => Boolean(value))),
  ).slice(0, 3)
}

function buildDescription(item: BackendPlace, category: Place['category']): string {
  if (item.address) {
    return item.address
  }
  return `대전의 ${categoryInfo[category].name.toLowerCase()} 스팟이에요.`
}

function mapPlace(item: BackendPlace): Place {
  const category = normalizeCategory(item.category)

  return {
    id: item.id,
    name: item.title,
    category,
    latitude: item.lat,
    longitude: item.lng,
    description: buildDescription(item, category),
    tags: buildTags(item, category),
    imageUrl: PLACEHOLDER_IMAGES[category],
  }
}

export async function getPlaces(): Promise<Place[]> {
  try {
    const response = await apiFetch<PlaceListResponse>('/map/places', { method: 'GET' })
    return response.items.map(mapPlace)
  } catch {
    const fallback = await apiFetch<SamplePlaceListResponse>('/dev/sample-places', { method: 'GET' })
    return fallback.items.map((item, index) =>
      mapPlace({
        id: `sample-${index}`,
        title: item.title,
        category: item.category,
        lat: item.lat,
        lng: item.lng,
        address: item.address,
      }),
    )
  }
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const places = await getPlaces()
  return places.find(place => place.id === id) ?? null
}

export async function listFeeds(positionId?: string): Promise<FeedPublic[]> {
  const query = positionId ? `?position_id=${encodeURIComponent(positionId)}` : ''
  try {
    const response = await apiFetch<FeedListResponse>(`/feed${query}`, { method: 'GET' })
    return response.items
  } catch {
    return []
  }
}

export async function getFeedDetail(feedId: string): Promise<FeedDetailResponse> {
  return apiFetch<FeedDetailResponse>(`/feed/${feedId}`, { method: 'GET' })
}

export async function createFeed(input: {
  position_id: string
  content: string
  image_url?: string | null
  lat: number
  lng: number
}): Promise<FeedPublic> {
  return apiFetch<FeedPublic>('/feed', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  })
}

export async function deleteFeed(feedId: string): Promise<void> {
  await apiFetch<void>(`/feed/${feedId}`, { method: 'DELETE', auth: true })
}

export async function createComment(feedId: string, content: string): Promise<CommentPublic> {
  return apiFetch<CommentPublic>(`/feed/${feedId}/comments`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ content }),
  })
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiFetch<void>(`/comments/${commentId}`, { method: 'DELETE', auth: true })
}

export async function devLogin(): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/dev/login', { method: 'POST' })
}

export async function seedPlaces(): Promise<void> {
  await apiFetch<void>('/dev/seed-places', { method: 'POST' })
}

export async function importTourApi(): Promise<void> {
  await apiFetch<void>('/dev/import-tourapi', { method: 'POST' })
}

export async function importDaejeonFestivals(): Promise<void> {
  await apiFetch<void>('/dev/import-daejeon-festivals', { method: 'POST' })
}
