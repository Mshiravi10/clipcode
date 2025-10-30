import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GITHUB_ID;
    const clientSecret = process.env.GITHUB_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;

    // Test GitHub API access
    let githubApiWorks = false;
    let githubApiError = null;

    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${clientSecret}`, // This will fail but tests connectivity
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        githubApiWorks = response.status === 401; // 401 means API is accessible
    } catch (error) {
        githubApiError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
        environment: {
            GITHUB_ID: clientId ? `✓ Set (${clientId.slice(0, 10)}...)` : '✗ Missing',
            GITHUB_SECRET: clientSecret ? `✓ Set (${clientSecret.length} chars)` : '✗ Missing',
            NEXTAUTH_URL: nextAuthUrl || '✗ Missing',
            NEXTAUTH_SECRET: nextAuthSecret ? '✓ Set' : '✗ Missing',
            NODE_ENV: process.env.NODE_ENV,
        },
        github: {
            apiAccessible: githubApiWorks,
            error: githubApiError,
        },
        recommendations: clientId && clientSecret && nextAuthUrl && nextAuthSecret
            ? ['All environment variables are set!', 'Try clearing browser cookies and signing in again.']
            : ['Some environment variables are missing!', 'Check your .env file.'],
    });
}

