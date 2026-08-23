import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787/api'

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as { error?: string } | undefined)?.error ??
        err.message ??
        'Request failed'
      return Promise.reject(new Error(message))
    }
    return Promise.reject(err)
  },
)
