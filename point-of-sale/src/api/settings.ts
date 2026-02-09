import { api } from '@/api'
import type { Settings } from '@/types/settings'

export async function getSettings() {
  return api.get<Settings>('/settings')
}

export async function updateSettings(patch: Partial<Settings>) {
  return api.put<Settings>('/settings', patch)
}
