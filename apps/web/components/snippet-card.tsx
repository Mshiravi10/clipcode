'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Globe, Lock, Star, StarOff } from 'lucide-react';
import Link from 'next/link';

interface SnippetCardProps {
    snippet: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        language: string;
        framework: string | null;
        code: string;
        isFavorite: boolean;
        isPublic?: boolean;
        usageCount: number;
        updatedAt: Date;
        owner?: {
            id: string;
            name: string | null;
            email: string | null;
        };
        tags: Array<{
            tag: {
                name: string;
                slug: string;
            };
        }>;
        _count?: {
            favorites: number;
        };
    };
    onCopy?: () => void;
    onToggleFavorite?: () => void;
    showOwner?: boolean;
    readOnly?: boolean;
}

export function SnippetCard({
    snippet,
    onCopy,
    onToggleFavorite,
    showOwner = false,
    readOnly = false
}: SnippetCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Link href={`/snippets/${snippet.slug}`}>
                            <CardTitle className="hover:underline">{snippet.title}</CardTitle>
                        </Link>
                        {snippet.description && (
                            <CardDescription className="mt-1">{snippet.description}</CardDescription>
                        )}
                        {showOwner && snippet.owner && (
                            <p className="text-xs text-muted-foreground mt-1">
                                by {snippet.owner.name || snippet.owner.email}
                            </p>
                        )}
                    </div>
                    {!readOnly && onToggleFavorite && (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onToggleFavorite}
                            className="shrink-0"
                        >
                            {snippet.isFavorite ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                                <StarOff className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge>{snippet.language}</Badge>
                        {snippet.framework && <Badge variant="secondary">{snippet.framework}</Badge>}
                        {snippet.isPublic !== undefined && (
                            <Badge variant={snippet.isPublic ? 'default' : 'secondary'}>
                                {snippet.isPublic ? (
                                    <>
                                        <Globe className="mr-1 h-3 w-3" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-1 h-3 w-3" />
                                        Private
                                    </>
                                )}
                            </Badge>
                        )}
                        {snippet.tags.map(({ tag }) => (
                            <Badge key={tag.slug} variant="outline">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto max-h-24">
                        <code>{snippet.code.slice(0, 200)}{snippet.code.length > 200 ? '...' : ''}</code>
                    </pre>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Used {snippet.usageCount} times</span>
                        <span>{formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}</span>
                    </div>

                    <Button onClick={onCopy} className="w-full" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


