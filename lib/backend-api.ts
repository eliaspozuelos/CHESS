export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  })
  if (res.status === 401) throw new Error('unauthenticated')
  let json: any = null
  try { json = await res.json() } catch (e) {}
  if (!res.ok) throw json || new Error(res.statusText)
  return json
}
