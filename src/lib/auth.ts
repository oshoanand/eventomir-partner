import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import YandexProvider from "next-auth/providers/yandex";
import GoogleProvider from "next-auth/providers/google";
import VkProvider from "next-auth/providers/vk";

// Helper to decode JWTs natively
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID as string,
      clientSecret: process.env.YANDEX_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    VkProvider({
      clientId: process.env.VK_CLIENT_ID as string,
      clientSecret: process.env.VK_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error(
              "Требуется указать адрес электронной почты и пароль",
            );
          }

          const backendUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

          // 1. Delegate Authentication to Node.js Backend
          const res = await fetch(`${backendUrl}/api/auth/partner/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          // 2. Handle Backend Rejections
          if (!res.ok) {
            throw new Error(
              data.message || "Неверный адрес электронной почты или пароль!",
            );
          }

          const { token, user } = data;

          if (!token) {
            throw new Error("Ошибка сервера: токен авторизации не получен.");
          }

          // 3. DECODE JWT NATIVELY TO EXTRACT ID AND ROLE
          const decodedToken = decodeJwt(token);

          if (!decodedToken || decodedToken.id === undefined) {
            throw new Error("Ошибка сервера: недействительный токен.");
          }

          const userId = decodedToken.id;
          const userRole =
            decodedToken.role !== undefined ? decodedToken.role : "partner";

          // 4. Return Payload to NextAuth
          return {
            id: userId,
            name: user?.name || "",
            email: user?.email || credentials.email,
            phone: user?.phone || null,
            role: userRole,
            image: user?.image || null,
            accessToken: token,
          };
        } catch (error: any) {
          console.error("🚨 Authorize Error:", error.message);
          throw new Error(error.message || "Системная ошибка сервера");
        }
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    // --- REDIRECT CALLBACK: Forces routing to /dashboard after login ---
    async redirect({ url, baseUrl }) {
      if (url.includes("/dashboard")) return url;
      return `${baseUrl}/dashboard`;
    },

    // --- JWT CALLBACK ---
    async jwt({ token, user, account, trigger, session }) {
      // Session Update hook
      if (trigger === "update" && session) {
        if (session.role !== undefined) token.role = session.role;
        if (session.accessToken) token.accessToken = session.accessToken;
      }

      // Initial Sign In Hook
      if (account && user) {
        const isOAuth = ["yandex", "google", "vk"].includes(
          account.provider || "",
        );

        if (isOAuth) {
          // OAUTH DELEGATION TO BACKEND
          try {
            const backendUrl =
              process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";
            const oauthRes = await fetch(`${backendUrl}/api/auth/oauth`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                email: user.email,
                name: user.name,
                image: user.image,
              }),
            });

            const oauthData = await oauthRes.json();

            if (oauthRes.ok && oauthData.token) {
              const decodedOAuthToken = decodeJwt(oauthData.token);

              if (decodedOAuthToken) {
                token.id = decodedOAuthToken.id;
                token.role =
                  decodedOAuthToken.role !== undefined
                    ? decodedOAuthToken.role
                    : "partner";
              }

              token.accessToken = oauthData.token;
            } else {
              console.error("OAuth Backend Sync Failed:", oauthData);
            }
          } catch (err) {
            console.error("OAuth Backend Fetch Error:", err);
          }
        } else {
          // Credentials login data mapping
          token.id = user.id;
          token.role = user.role !== undefined ? user.role : "partner";
          token.accessToken = user.accessToken;
        }

        // Standard user info mapping is handled by NextAuth defaults,
        // but we explicitly sync these if they are present on the returned user object.
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
        if (user.image) token.picture = user.image;
      }

      return token;
    },

    // --- SESSION CALLBACK ---
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
