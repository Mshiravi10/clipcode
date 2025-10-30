import { EmptyState } from '@/components/empty-state';
import { SnippetCard } from '@/components/snippet-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Globe, Lock, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CollectionPageProps {
    params: {
        slug: string;
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const session = await requireAuth();

    const collection = await prisma.collection.findFirst({
        where: {
            slug: params.slug,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            snippets: {
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            },
            _count: {
                select: { snippets: true },
            },
        },
    });

    if (!collection) {
        notFound();
    }

    const isOwner = collection.ownerId === session.user.id;

    // Check access: owner or public collection
    if (!isOwner && !(collection as any).isPublic) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{collection.name}</h1>
                        <Badge variant={collection.isPublic ? 'default' : 'secondary'}>
                            {collection.isPublic ? (
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
                    </div>
                    <p className="text-muted-foreground">
                        {collection.snippets.length} snippet
                        {collection.snippets.length !== 1 ? 's' : ''}
                        {!isOwner && collection.owner.name && (
                            <> · Created by {collection.owner.name}</>
                        )}
                    </p>
                </div>
                {isOwner && (
                    <Button asChild>
                        <Link href={`/collections/${collection.slug}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Collection
                        </Link>
                    </Button>
                )}
            </div>

            {collection.snippets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {collection.snippets.map((snippet) => (
                        <SnippetCard
                            key={snippet.id}
                            snippet={{
                                ...snippet,
                                isFavorite: snippet.isFavorite,
                                _count: { favorites: 0 },
                            }}
                            showOwner={!isOwner}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No snippets in this collection"
                    description={
                        isOwner
                            ? 'Add snippets to this collection from the snippets page'
                            : 'This collection is empty'
                    }
                    actionLabel={isOwner ? 'Go to Snippets' : undefined}
                    actionHref={isOwner ? '/snippets' : undefined}
                />
            )}
        </div>
    );
}

