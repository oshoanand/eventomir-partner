import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        transferToken: { label: "Transfer Token", type: "text" }, // Added to accept the SSO token
      },

      async authorize(credentials) {
        try {
          const secret = process.env.NEXTAUTH_SECRET;
          if (!secret) {
            throw new Error("Ошибка конфигурации сервера");
          }

          // =================================================================
          // SCENARIO 1: SEAMLESS LOGIN VIA TRANSFER TOKEN (SSO from Main App)
          // =================================================================
          if (credentials?.transferToken) {
            try {
              // 1. Verify the JWT signature
              const decoded = jwt.verify(
                credentials.transferToken,
                secret,
              ) as jwt.JwtPayload;

              // 2. Fetch fresh user data from DB to ensure they still exist
              const user = await prisma.user.findUnique({
                where: { id: decoded.id },
              });

              if (!user) {
                throw new Error("Пользователь не найден.");
              }

              // 3. STRICT ROLE CHECK: Only partners allowed
              if (user.role !== "partner") {
                throw new Error(
                  "Доступ запрещен. Этот портал только для партнеров.",
                );
              }

              // 4. Success! Return user to establish session
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                accessToken: credentials.transferToken, // Reuse the verified token
              };
            } catch (tokenError) {
              console.error("Token Verification Error:", tokenError);
              throw new Error(
                "Срок действия ссылки истек или токен недействителен. Пожалуйста, авторизуйтесь заново.",
              );
            }
          }

          // =================================================================
          // SCENARIO 2: DIRECT EMAIL & PASSWORD LOGIN ON PARTNER APP
          // =================================================================
          if (!credentials?.email || !credentials?.password) {
            throw new Error(
              "Требуется указать адрес электронной почты и пароль",
            );
          }

          // 1. Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          // 2. Verify user exists AND has a password
          if (!user || !user.password) {
            throw new Error("Неверный адрес электронной почты или пароль!");
          }

          // 3. STRICT ROLE CHECK: Block Customers/Performers from logging in here
          if (user.role !== "partner") {
            throw new Error(
              "Доступ запрещен. Кабинет партнера находится на другой платформе.",
            );
          }

          // 4. Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Неверный адрес электронной почты или пароль!");
          }

          // 5. Generate fresh JWT Token
          const token = jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            },
            secret,
            {
              algorithm: "HS256",
            },
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accessToken: token,
          };
        } catch (error: any) {
          console.error("Authorize Error:", error);

          // Let custom user-friendly messages pass through to the frontend UI
          const customErrors = [
            "Требуется указать адрес электронной почты и пароль",
            "Неверный адрес электронной почты или пароль!",
            "Доступ запрещен. Этот портал только для партнеров.",
            "Доступ запрещен. Кабинет партнера находится на другой платформе.",
            "Срок действия ссылки истек или токен недействителен. Пожалуйста, авторизуйтесь заново.",
            "Пользователь не найден.",
          ];

          if (customErrors.includes(error.message)) {
            throw new Error(error.message);
          }

          // Mask unhandled DB/system crashes
          throw new Error(
            "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.",
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image ? user.image.toString() : null;
        token.name = user.name ? user.name.toString() : "";
        token.email = user.email ? user.email.toString() : "";
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
