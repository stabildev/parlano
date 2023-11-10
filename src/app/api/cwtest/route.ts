export const GET = async (req: Request) => {
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

  const response = await fetch(cloudWorkerUrl, { headers })

  return new Response(response.body, {
    status: response.status,
  })
}
