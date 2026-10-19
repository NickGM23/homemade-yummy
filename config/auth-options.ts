import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hashSync } from 'bcrypt';
import { prisma } from '@/server/prisma';
import type { AuthOptions } from 'next-auth';
import { UserRole } from '@/@types/user';
import { normalizeUaPhone } from '@/server/phone';

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      // GitHub додає `iss` у callback (RFC 9207); без issuer openid-client кидає
      // "issuer must be configured on the issuer". Значення має збігатися з `iss`.
      issuer: 'https://github.com/login/oauth',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.password) {
          return null;
        }

        // Вхід паролем — лише за телефоном (будь-який запис: 099…, +380…).
        const phone = normalizeUaPhone(credentials.phone);
        if (!phone) {
          return null;
        }

        const findUser = await prisma.user.findUnique({ where: { phone } });

        if (!findUser) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, findUser.password);

        if (!isPasswordValid) {
          return null;
        }

        // if (!findUser.verified) {
        //    return null;
        //  }

        const role: UserRole = findUser.isAdmin ? 'admin' : 'user';

        return {
          id: String(findUser.id),
          email: findUser.email,
          fullName: findUser.fullName,
          role: role,
          //image: null
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 48,
  },
  jwt: {
    maxAge: 60 * 60 * 48,
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'credentials') {
          return true;
        }

        if (!user.email) {
          return false;
        }

        const findUser = await prisma.user.findFirst({
          where: {
            OR: [
              { provider: account?.provider, providerAccountId: account?.providerAccountId },
              { email: user.email },
            ],
          },
        });

        if (findUser) {
          await prisma.user.update({
            where: {
              id: findUser.id,
            },
            data: {
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          });

          return true;
        }

        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name || 'User #' + user.id,
            password: hashSync(user.id.toString(), 10),
            verified: new Date(),
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
          },
        });

        return true;
      } catch (error) {
        console.error('Error [SIGNIN]', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Після першого входу в токені вже є id нашого користувача — далі шукаємо тільки за ним
      // (email може бути відсутній: користувач, що зареєструвався по телефону).
      // На самому вході id беремо з `user` (credentials) або шукаємо за email (OAuth: там
      // `user.id` — це id провайдера, а не наш).
      let findUser = null;

      if (token.id) {
        findUser = await prisma.user.findUnique({ where: { id: Number(token.id) } });
      } else if (account?.provider === 'credentials' && user?.id) {
        findUser = await prisma.user.findUnique({ where: { id: Number(user.id) } });
      } else if (token.email) {
        findUser = await prisma.user.findUnique({ where: { email: token.email } });
      }

      if (findUser) {
        const role: UserRole = findUser.isAdmin ? 'admin' : 'user';
        token.id = String(findUser.id);
        token.email = findUser.email;
        token.phone = findUser.phone;
        token.fullName = findUser.fullName;
        token.role = role;
      }

      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.fullName = token.fullName;
        session.user.email = token.email ?? null;
        session.user.phone = token.phone ?? null;
      }

      return session;
    },
  },
};
