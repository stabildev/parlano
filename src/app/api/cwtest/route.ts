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

  return new Response(cookieString)
}
