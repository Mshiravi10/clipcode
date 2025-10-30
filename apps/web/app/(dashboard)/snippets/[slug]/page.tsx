'use client';

import { SnippetEditor } from '@/components/snippet-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { Edit, History, Play, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CopyButton } from './copy-button';

interface SnippetData {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    framework: string | null;
    slug: string;
    usageCount: number;
    updatedAt: string;
    tags: Array<{
        tag: {
            slug: string;
            name: string;
        };
    }>;
    collection: {
        id: string;
        name: string;
    } | null;
}

export default function SnippetDetailPage() {
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
                setSnippet(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load snippet');
            } finally {
                setLoading(false);
            }
        }

        fetchSnippet();
    }, [params.slug, session, status, router]);

    const handleDelete = async () => {
        if (!snippet) return;

        if (!confirm('Are you sure you want to delete this snippet?')) {
            return;
        }

        try {
            const response = await fetch(`/api/snippets/${snippet.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete snippet');
            }

            toast.success('Snippet deleted successfully');
            router.push('/snippets');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete snippet');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
                        <div className="mt-2 h-6 w-96 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
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
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{snippet.title}</h1>
                    {snippet.description && (
                        <p className="mt-2 text-muted-foreground">{snippet.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="default" asChild>
                        <Link href={`/snippets/${params.slug}/playground`}>
                            <Play className="mr-2 h-4 w-4" />
                            Playground
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/snippets/${params.slug}/versions`}>
                            <History className="mr-2 h-4 w-4" />
                            History
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/snippets/${params.slug}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Code</CardTitle>
                                <CopyButton snippetId={snippet.id} code={snippet.code} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SnippetEditor
                                value={snippet.code}
                                onChange={() => { }}
                                language={snippet.language}
                                readOnly
                                height="600px"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Language</Label>
                                <div className="mt-1">
                                    <Badge>{snippet.language}</Badge>
                                </div>
                            </div>

                            {snippet.framework && (
                                <div>
                                    <Label className="text-sm text-muted-foreground">Framework</Label>
                                    <div className="mt-1">
                                        <Badge variant="secondary">{snippet.framework}</Badge>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm text-muted-foreground">Tags</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {snippet.tags.map(({ tag }) => (
                                        <Badge key={tag.slug} variant="outline">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Used</Label>
                                <p className="mt-1 text-sm">{snippet.usageCount} times</p>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Updated</Label>
                                <p className="mt-1 text-sm">
                                    {formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

