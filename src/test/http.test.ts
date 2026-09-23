import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, fetchJson } from '@/lib/http'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function mockFetch(impl: () => Promise<Response>): void {
  vi.stubGlobal('fetch', vi.fn(impl))
}

describe('fetchJson', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    await expect(fetchJson('https://example.com')).resolves.toEqual({
      ok: true,
    })
  })

  it('maps HTTP failures to http errors with status', async () => {
    mockFetch(async () => new Response('oops', { status: 500 }))
    const error = await fetchJson('https://example.com').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('http')
    expect((error as ApiError).status).toBe(500)
  })

  it('gives rate limiting a dedicated message', async () => {
    mockFetch(async () => new Response('slow down', { status: 429 }))
    const error = await fetchJson('https://example.com').catch((e) => e)
    expect((error as ApiError).kind).toBe('http')
    expect((error as ApiError).message).toMatch(/many requests/i)
  })

  it('maps connection failures to network errors', async () => {
    mockFetch(async () => {
      throw new TypeError('fetch failed')
    })
    const error = await fetchJson('https://example.com').catch((e) => e)
    expect((error as ApiError).kind).toBe('network')
  })

  it('maps timeouts to timeout errors', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise<never>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('aborted', 'AbortError'))
            })
          }),
      ),
    )
    const pending = fetchJson('https://example.com', { timeoutMs: 1000 })
    const settled = pending.catch((e) => e)
    await vi.advanceTimersByTimeAsync(1001)
    const error = await settled
    expect((error as ApiError).kind).toBe('timeout')
  })

  it('maps invalid JSON to parse errors', async () => {
    mockFetch(async () => new Response('not-json{{{', { status: 200 }))
    const error = await fetchJson('https://example.com').catch((e) => e)
    expect((error as ApiError).kind).toBe('parse')
  })
})
