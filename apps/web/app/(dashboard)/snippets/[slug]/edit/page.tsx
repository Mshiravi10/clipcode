'use client';

import { SnippetForm } from '@/components/snippet-form';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SnippetData {
    id: string;
    title: string;
    language: string;
    framework: string;
    description: string;
    code: string;
    tags: string;
    collectionId?: string;
}

export default function EditSnippetPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [snippet, setSnippet] = useState<SnippetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        async function fetchSnippet() {
            try {
                const response = await fetch(`/api/snippets/${params.slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        router.push('/snippets');
                        return;
                    }
                    throw new Error('Failed to fetch snippet');
                }
                const { data } = await response.json();

                // Convert tags to comma-separated string
                const tags = data.tags?.map((t: any) => t.tag.slug).join(', ') || '';

                setSnippet({
                    id: data.id,
                    title: data.title,
                    language: data.language,
                    framework: data.framework || '',
                    description: data.description || '',
                    code: data.code,
                    tags,
                    collectionId: data.collectionId || undefined,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load snippet');
            } finally {
                setLoading(false);
            }
        }

        fetchSnippet();
    }, [params.slug, session, status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Snippet</h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Error</h1>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!snippet) {
        return null;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Snippet</h1>
                <p className="text-muted-foreground">
                    Make changes to your snippet
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <SnippetForm mode="edit" initialData={snippet} />
                </CardContent>
            </Card>
        </div>
    );
}

