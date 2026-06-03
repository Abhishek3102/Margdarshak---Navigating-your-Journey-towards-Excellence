
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. PERFORMANCE: Skip middleware for static assets, images, and API routes (managed separately)
    // The matcher handles most, but explicit return here prevents unnecessary `getUser` calls
    if (
        path.startsWith("/_next") ||
        path.startsWith("/api") || // Let API routes handle their own auth or be public
        path.startsWith("/static") ||
        path.includes(".") // Heuristic for files (css, js, images)
    ) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 2. Define Routes
    const isLoginRoute = path === "/login";
    const isPublicRoute =
        path === "/" ||
        path === "/login" ||
        path.startsWith("/auth") ||
        path.startsWith("/public");

    // 3. Conditional User Fetching (Save latency on public landing pages)
    // We only need user if:
    // a) We are on a protected route (to verify)
    // b) We are on /login (to redirect if already logged in)
    // c) For "/" we usually let the client handle auth state to speed up FCP

    // Check for session cookie presence as a heuristic to avoid network call?
    // Supabase cookies usually named `sb-[project]-auth-token`
    // But simplest safely is: Only await getUser if NOT public OR isLoginRoute

    let user = null;
    if (!isPublicRoute || isLoginRoute) {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    }

    // 4. Redirect Logic
    if (!user && !isPublicRoute) {
        // Redirect to login if user is not authenticated and trying to access a protected route
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If user IS logged in and tries to visit login page, send to dashboard
    if (user && isLoginRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
