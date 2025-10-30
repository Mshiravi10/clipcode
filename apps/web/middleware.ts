import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/auth/signin',
    },
});

export const config = {
    matcher: [
        '/',
        '/snippets/:path*',
        '/tags/:path*',
        '/collections/:path*',
        '/import/:path*',
        '/export/:path*',
        '/logs/:path*',
    ],
};

