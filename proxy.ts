import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

function normalizePath(urlOrPath: string): string {
  try {
    const parsed = new URL(urlOrPath)
    return parsed.pathname.replace(/\/$/, "") || "/"
  } catch {
    return urlOrPath.replace(/\/$/, "") || "/"
  }
}

const signInUrl = normalizePath(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in")
const signUpUrl = normalizePath(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up")

const isPublicRoute = createRouteMatcher([
  `${signInUrl}(.*)`,
  `${signUpUrl}(.*)`,
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}