// =============================================================
// src/lib/api/client.ts
// Base HTTP client with error handling, timeout, and CORS proxy
// support for browser-side OSINT requests
// =============================================================

const DEFAULT_TIMEOUT_MS = 12000;

export class ApiRequestError extends Error {
  constructor(
    public source: string,
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Core fetch wrapper with timeout support.
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiRequestError('network', 'Request timed out');
    }
    throw err;
  }
}

/**
 * GET JSON helper. Throws ApiRequestError on non-2xx.
 */
export async function getJSON<T>(
  url: string,
  source: string,
  options: FetchOptions = {},
): Promise<T> {
  const res = await apiFetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError(source, `${source}: ${res.status} ${detail}`, res.status);
  }

  return res.json() as Promise<T>;
}

/** Generate a unique ID for evidence / alert items */
export function uid(prefix = 'ev'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Current ISO timestamp */
export function nowISO(): string {
  return new Date().toISOString();
}
