import type { User, LoginResponse } from '@/types'
import { mockUsers } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function login(username: string, password: string): Promise<LoginResponse> {
  await delay(500)
  const user = mockUsers.find(u => u.username === username)
  if (!user) {
    throw new Error('用户名或密码错误')
  }
  if (password !== '123456') {
    throw new Error('用户名或密码错误')
  }
  if (user.status === 'inactive') {
    throw new Error('账户已被禁用，请联系管理员')
  }
  const token = 'mock_token_' + Date.now() + '_' + user.id
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return { token, user }
}

export async function logout(): Promise<void> {
  await delay(200)
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(100)
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export async function verifyIdentity(userId: number): Promise<boolean> {
  await delay(300)
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return false
  return !!user.idCard
}
