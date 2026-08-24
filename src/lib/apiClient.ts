import ky, { HTTPError, isHTTPError } from 'ky'

const prefix = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787/api'

export const api = ky.create({
  prefix,
  hooks: {
    beforeError: [
      ({ error }) => {
        if (isHTTPError(error)) {
          const data = error.data
          if (typeof data === 'object' && data !== null && 'error' in data) {
            const message = (data as { error?: unknown }).error
            if (typeof message === 'string' && message.length > 0) {
              error.message = message
            }
          }
        }
        return error
      },
    ],
  },
})

export const toErrorMessage = (err: unknown, fallback = 'Request failed') => {
  if (err instanceof HTTPError) return err.message || fallback
  if (err instanceof Error) return err.message
  return fallback
}
