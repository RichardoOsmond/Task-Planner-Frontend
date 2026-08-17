const BASE = import.meta.env.VITE_API_URL ?? ""

export class ApiError extends Error {
    status: number
    body: unknown
    constructor(status: number, body: unknown) {
        super(`API ${status}`)
        this.status = status
        this.body = body
    }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'content-type': 'application/json',
            ...options.headers,
        },
    })

    const contentType = res.headers.get('content-type') ?? ''
    const body = contentType.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
        throw new ApiError(res.status, body)
    }
    return body as T
}