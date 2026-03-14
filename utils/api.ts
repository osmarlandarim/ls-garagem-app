import { getToken } from '@/utils/auth-storage';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}
