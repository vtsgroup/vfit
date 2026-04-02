import { describe, expect, it } from 'vitest'
import {
  createSession,
  getSession,
  listUserSessions,
  revokeSession,
  type SessionData,
} from '@lib/auth-helpers'

class MemoryKV {
  private store = new Map<string, string>()

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value)
  }

  async get<T = string>(key: string, type?: 'text' | 'json'): Promise<T | null> {
    const raw = this.store.get(key)
    if (!raw) return null
    if (type === 'json') return JSON.parse(raw) as T
    return raw as T
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async list(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }> {
    const prefix = options?.prefix ?? ''
    const limit = options?.limit ?? 1000

    const keys = [...this.store.keys()]
      .filter((name) => name.startsWith(prefix))
      .slice(0, limit)
      .map((name) => ({ name }))

    return { keys }
  }
}

describe('auth sessions helpers', () => {
  it('cria e lista sessões por usuário', async () => {
    const kv = new MemoryKV() as unknown as KVNamespace

    const base: SessionData = {
      userId: 'user-1',
      userType: 'personal',
      email: 'user1@test.com',
      createdAt: '2026-02-26T13:00:00.000Z',
    }

    await createSession(kv, 'session-a', base)
    await createSession(kv, 'session-b', { ...base, createdAt: '2026-02-26T13:05:00.000Z' })

    const sessions = await listUserSessions(kv, 'user-1', 10)

    expect(sessions).toHaveLength(2)
    expect(sessions[0]?.sessionId).toBe('session-b')
    expect(sessions[1]?.sessionId).toBe('session-a')

    const sessionA = await getSession(kv, 'session-a')
    expect(sessionA?.email).toBe('user1@test.com')
  })

  it('revoga sessão e limpa índice do usuário', async () => {
    const kv = new MemoryKV() as unknown as KVNamespace

    await createSession(kv, 'session-x', {
      userId: 'user-2',
      userType: 'student',
      email: 'user2@test.com',
      createdAt: '2026-02-26T14:00:00.000Z',
    })

    await revokeSession(kv, 'session-x')

    const session = await getSession(kv, 'session-x')
    const sessions = await listUserSessions(kv, 'user-2', 10)

    expect(session).toBeNull()
    expect(sessions).toHaveLength(0)
  })
})
