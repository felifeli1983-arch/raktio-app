/** Raktio — API base client */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  // TODO: implement with auth headers
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}
