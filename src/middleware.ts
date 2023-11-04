import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/dist/server'

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
}

export default authMiddleware
