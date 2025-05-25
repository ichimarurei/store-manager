import { UserDocument } from '@/models/user.schema';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: { username: { label: 'Nama Akun', type: 'text' }, password: { label: 'Kata Sandi', type: 'text' } },
            async authorize(credentials) {
                const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: credentials?.username, password: credentials?.password })
                });
                const user: UserDocument = await response.json();

                return response.ok && user ? { id: `${user._id}`, name: user.username, email: `${user.privilege}@store.manager-v.1.0.0` } : null;
            }
        })
    ],
    pages: { signIn: '/auth' }
};

const handler = NextAuth(authOptions);

export { authOptions, handler as GET, handler as POST };
