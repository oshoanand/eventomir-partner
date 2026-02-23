import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // 1. If the user already has a valid NextAuth session cookie, allow access
        if (token) return true;

        // 2. CRITICAL FIX: If the request contains our SSO transfer token (?v=...),
        // allow the request to pass through to the React page.
        // The React component will then handle the actual login process.
        if (req.nextUrl.searchParams.has("v")) return true;

        // 3. Otherwise, block access (This triggers the redirect to the signIn page)
        return false;
      },
    },
    pages: {
      // If unauthorized, send them back to the Main App to log in
      signIn: process.env.NEXT_PUBLIC_WEB_APP_URL
        ? `${process.env.NEXT_PUBLIC_WEB_APP_URL}/login`
        : "http://localhost:3000/login",
    },
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|public|sounds|manifest.json|$).*)",
  ],
};
