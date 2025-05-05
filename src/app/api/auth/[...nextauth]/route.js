import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import { comparePassword } from '@/lib/auth';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // 查找用户
        const [users] = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [credentials.email]
        );
        if (users.length === 0) {
          return null;
        }
        const user = users[0];
        // 验证密码
        const isValid = await comparePassword(credentials.password, user.password_hash);
        if (!isValid) {
          return null;
        }
        // 返回给 session 的用户对象
        return {
          id: user.user_id,
          name: user.username,
          email: user.email,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.JWT_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 