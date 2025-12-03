import { type NextRequest, NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  id: string
  name: string
  email: string
  iat: number
  exp: number
}

// Add paths that require authentication
const protectedPaths = ["/profile", "/dashboard", "/recommendations", "/feedback"]

// Add paths that should redirect to home if already authenticated
const authPaths = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value || request.headers.get("Authorization")?.split(" ")[1]

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Check if the path should redirect when authenticated
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // If no token and trying to access protected route
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If token exists, verify it
  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Date.now() / 1000

      // If token is expired
      if (decoded.exp < currentTime) {
        // For protected paths, redirect to login
        if (isProtectedPath) {
          const url = new URL("/login", request.url)
          url.searchParams.set("callbackUrl", pathname)
          return NextResponse.redirect(url)
        }
      } else if (isAuthPath) {
        // If token is valid and user is trying to access auth pages, redirect to home
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      // Invalid token
      if (isProtectedPath) {
        const url = new URL("/login", request.url)
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
