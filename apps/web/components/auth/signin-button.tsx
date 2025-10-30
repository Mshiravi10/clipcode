'use client';

import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface SignInButtonProps {
    callbackUrl?: string;
}

export function SignInButton({ callbackUrl = '/' }: SignInButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('github', {
                callbackUrl,
                redirect: true,
            });
        } catch (error) {
            console.error('Sign in error:', error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
        >
            <Github className="mr-2 h-5 w-5" />
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
        </Button>
    );
}


