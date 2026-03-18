import { mockPlaces } from '../data/mockPlaces'
import type { Place } from '../data/mockPlaces'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function getPlaces(): Promise<Place[]> {
  if (!API_BASE_URL) {
    return Promise.resolve(mockPlaces)
  }

  try {
    const res = await fetch(`${API_BASE_URL}/places`)
    if (!res.ok) {
      throw new Error('Failed to fetch places')
    }

    return res.json()
  } catch (error) {
    console.warn('Failed to fetch places from backend, falling back to mock:', error)
    return mockPlaces
  }
}
