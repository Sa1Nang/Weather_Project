import { apiConfig } from '@/lib/config'

/** Machine-readable failure categories for friendly UI messages. */
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

interface FetchJsonOptions {
  /** Per-request timeout override (defaults to apiConfig). */
  timeoutMs?: number
  /** Allows callers (TanStack Query) to cancel in-flight requests. */
  signal?: AbortSignal
}

/**
 * Single JSON fetch entry point for all services.
 * UI components must never call fetch() directly.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? apiConfig.requestTimeoutMs
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const forwardAbort = () => controller.abort()
  options.signal?.addEventListener('abort', forwardAbort)

  try {
    let response: Response
    try {
      response = await fetch(url, { signal: controller.signal })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Distinguish caller cancellation from our own timeout.
        if (options.signal?.aborted) {
          throw new ApiError('network', 'Request was cancelled.')
        }
        throw new ApiError(
          'timeout',
          'The weather service is taking too long to respond. Please try again.',
        )
      }
      throw new ApiError(
        'network',
        'Could not reach the weather service. Please check your connection and try again.',
      )
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiError(
          'http',
          'Too many requests right now. Please wait a moment and try again.',
          response.status,
        )
      }
      throw new ApiError(
        'http',
        'Weather data could not be loaded. Please try again later.',
        response.status,
      )
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new ApiError(
        'parse',
        'The weather service returned an unexpected response. Please try again.',
        response.status,
      )
    }
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', forwardAbort)
  }
}

/** User-friendly message for any thrown value (never leaks stack traces). */
export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Something went wrong. Please try again.'
}
