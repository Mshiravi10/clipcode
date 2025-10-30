// import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
    // Temporarily disable adapter for debugging
    // adapter: PrismaAdapter(prisma),
    debug: process.env.NODE_ENV === 'development',
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user user:email',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // On sign in, add user info to token
            if (user) {
                const email = user.email || (profile as any)?.email;
                const githubId = (profile as any)?.id?.toString();
                const fallbackEmail = !email && githubId ? `github-${githubId}@clipcode.local` : null;
                const finalEmail = email || fallbackEmail;

                console.log('✅ JWT Callback - User signed in:', finalEmail);

                if (finalEmail) {
                    // Get user from database to get the correct ID
                    const dbUser = await prisma.user.findUnique({
                        where: { email: finalEmail },
                    });

                    if (dbUser) {
                        token.id = dbUser.id;
                        token.email = dbUser.email;
                        token.name = dbUser.name;
                        token.picture = dbUser.image;
                        console.log('✅ User ID from database:', dbUser.id);
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add user ID from token to session
            if (session.user && token) {
                console.log('✅ Session Callback - Creating session for:', token.email);
                session.user.id = token.id as string;
                session.user.email = token.email as string | null;
                session.user.name = token.name as string | null;
                session.user.image = token.picture as string | null;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            console.log('🔐 SignIn Callback - User:', user?.email || 'No email');
            console.log('🔍 Profile data:', JSON.stringify(profile, null, 2));

            // Get email from profile if not in user
            const email = user?.email || (profile as any)?.email;
            const githubId = (profile as any)?.id?.toString();

            if (!email && githubId) {
                // Use GitHub ID as fallback email
                const fallbackEmail = `github-${githubId}@clipcode.local`;
                console.log(`⚠️ No email found, using fallback: ${fallbackEmail}`);

                try {
                    await prisma.user.upsert({
                        where: { email: fallbackEmail },
                        update: {
                            name: user.name,
                            image: user.image,
                        },
                        create: {
                            email: fallbackEmail,
                            name: user.name,
                            image: user.image,
                            role: 'USER',
                        },
                    });
                    console.log('✅ User synced to database with fallback email');
                } catch (error) {
                    console.error('❌ Failed to sync user to database:', error);
                }
            } else if (email) {
                try {
                    await prisma.user.upsert({
                        where: { email },
                        update: {
                            name: user.name,
                            image: user.image,
                        },
                        create: {
                            email,
                            name: user.name,
                            image: user.image,
                            role: 'USER',
                        },
                    });
                    console.log('✅ User synced to database:', email);
                } catch (error) {
                    console.error('❌ Failed to sync user to database:', error);
                }
            }

            return true;
        },
    },
    // events: {
    //     signIn: async ({ user, account }) => {
    //         await logAuthEvent({
    //             type: 'signin_success',
    //             userId: user.id,
    //             email: user.email || undefined,
    //             provider: account?.provider,
    //         });
    //     },
    //     signOut: async ({ session }) => {
    //         await logAuthEvent({
    //             type: 'signout',
    //             userId: session?.user?.id,
    //         });
    //     },
    //     createUser: async ({ user }) => {
    //         await logAuthEvent({
    //             type: 'session_created',
    //             userId: user.id,
    //             email: user.email || undefined,
    //         });
    //     },
    //     session: async ({ session, token }) => {
    //         if (session?.user?.id || token?.sub) {
    //             await logAuthEvent({
    //                 type: 'session_retrieved',
    //                 userId: session?.user?.id || token?.sub,
    //                 email: session?.user?.email || undefined,
    //             });
    //         }
    //     },
    // },
    // logger: {
    //     error(code, metadata) {
    //         console.error('❌ NextAuth Error:', code, metadata);
    //     },
    //     warn(code) {
    //         console.warn('⚠️ NextAuth Warning:', code);
    //     },
    //     debug(code, metadata) {
    //         console.log('🔍 NextAuth Debug:', code, metadata);
    //     },
    // },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
    },
    session: {
        strategy: 'jwt', // Use JWT strategy
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    // Fix cookie configuration for IP-based development
    useSecureCookies: false,
    cookies: {
        sessionToken: {
            name: 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false, // Disable secure for IP-based development
                domain: undefined, // Don't set domain for IP addresses
            },
        },
        callbackUrl: {
            name: 'next-auth.callback-url',
            options: {
                sameSite: 'lax',
                path: '/',
                secure: false,
                domain: undefined,
            },
        },
        csrfToken: {
            name: 'next-auth.csrf-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false,
                domain: undefined,
            },
        },
    },
};
