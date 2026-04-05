import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/teams",
  "/notifications",
  "/booking",
  "/owner",
]

// Routes that logged-in users should be redirected away from
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/welcome"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh the session if expired — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Skip middleware for API routes (they handle auth themselves)
  if (pathname.startsWith("/api/")) return response

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  let profileRole: "player" | "owner" | "admin" | null = null
  const resolveRole = async () => {
    if (!user || user.is_anonymous) return null
    if (profileRole) return profileRole
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    profileRole = (profile?.role as "player" | "owner" | "admin" | undefined) ?? null
    return profileRole
  }

  // Allow both real users AND anonymous (guest) Supabase users through protected routes
  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Only redirect away from auth routes if the user has a real (non-anonymous) account
  if (isAuthRoute && user && !user.is_anonymous) {
    const role = await resolveRole()
    const destination = role === "owner" || role === "admin" ? "/owner" : "/dashboard"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Keep owner and player surfaces isolated to prevent cross-view leaks.
  if (user && !user.is_anonymous) {
    const role = await resolveRole()
    const isOwner = role === "owner" || role === "admin"

    if (pathname.startsWith("/owner") && !isOwner) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname === "/dashboard" && isOwner) {
      return NextResponse.redirect(new URL("/owner", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all request paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
