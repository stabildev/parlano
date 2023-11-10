import { SendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  const message = req.nextUrl.searchParams.get('message')
  const fileId = req.nextUrl.searchParams.get('fileId')

  if (!message || !fileId) {
    return new Response('Bad request', { status: 400 })
  }

  const cookies = req.headers.get('cookie')

  const authCookies = [
    'refresh_token',
    'access_token',
    'id_token',
    'access_token_payload',
    'id_token_payload',
    'user',
  ]

  const cookieString = cookies
    ?.split(';')
    .map((c) => c.trim().split('='))
    .filter(([key]) => authCookies.includes(key))
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')

  if (!cookieString) {
    return new Response('Unauthorized', { status: 401 })
  }

  const headers = new Headers()
  headers.append('Cookie', cookieString)

  const cloudWorkerUrl =
    'https://parlano-openai-gateway.hardcoded-digital.workers.dev/'

  const response = await fetch(cloudWorkerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      fileId,
    } satisfies SendMessageValidator),
  })

  return new Response(response.body, {
    status: response.status,
  })
}
