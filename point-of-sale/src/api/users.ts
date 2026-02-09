import { api } from '@/api'
import type { User } from '@/types/user'

export async function listUsers() {
  return api.get<User[]>('/users')
}

export type CreateUserInput = {
  name: string
  username: string
  password: string
  role?: 'ADMIN' | 'MANAGER' | 'CASHIER'
}

export async function createUser(data: CreateUserInput) {
  return api.post<User>('/users', data)
}
