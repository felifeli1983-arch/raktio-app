/**
 * Raktio API Client
 *
 * Base HTTP client for the FastAPI backend.
 * Handles auth headers, workspace scoping, and error normalization.
 *
 * Auth: Supabase JWT via Authorization: Bearer header.
 * Workspace: passed as query parameter on every request.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// TODO: Replace with real Supabase auth token retrieval
// For now, these are set from the auth flow or dev tools
let _authToken: string | null = null;
let _workspaceId: string | null = null;

export function setAuthToken(token: string) { _authToken = token; }
export function setWorkspaceId(id: string) { _workspaceId = id; }
export function getWorkspaceId(): string | null { return _workspaceId; }
export function getAuthToken(): string | null { return _authToken; }

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    skipWorkspace?: boolean;
  } = {},
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);

  // Add workspace_id to all requests unless skipped
  if (!options.skipWorkspace && _workspaceId) {
    url.searchParams.set('workspace_id', _workspaceId);
  }

  // Add query params
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {}

    // Redirect to login on auth failures
    if (res.status === 401) {
      window.location.hash = '#/login';
    }

    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>('GET', path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),

  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};

/**
 * Create an SSE EventSource connection with auth.
 * EventSource doesn't support custom headers, so we pass token as query param.
 */
export function createEventSource(path: string, params?: Record<string, string>): EventSource {
  const url = new URL(`${API_URL}${path}`);
  if (_authToken) url.searchParams.set('token', _authToken);
  if (_workspaceId) url.searchParams.set('workspace_id', _workspaceId);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return new EventSource(url.toString());
}
