import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
}

export default withAuth(async function middleware(req: any) {}, {
  isAuthorized: ({ user }: { user: any }) => {
    return user?.id
  },
})
