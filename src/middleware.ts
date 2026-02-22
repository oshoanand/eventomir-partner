import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: `${process.env.NEXT_PUBLIC_WEB_APP_URL}/login` },
});

export const config = {
  matcher: [
    // Added |$ at the end of the exclusion list to ignore the root path "/"
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|public|sounds|manifest.json|$).*)",
  ],
};
