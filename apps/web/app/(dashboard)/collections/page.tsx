import { CollectionCard } from '@/components/collection-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CollectionsPage() {
    const session = await requireAuth();

    const collections = await prisma.collection.findMany({
        where: { ownerId: session.user.id },
        include: {
            _count: {
                select: { snippets: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Collections</h1>
                    <p className="text-muted-foreground">Organize your snippets into collections</p>
                </div>
                <Button asChild>
                    <Link href="/collections/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Collection
                    </Link>
                </Button>
            </div>

            {collections.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {collections.map(collection => (
                        <CollectionCard key={collection.id} collection={collection} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium mb-2">No collections yet</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create a collection to organize your snippets
                        </p>
                        <Button asChild>
                            <Link href="/collections/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Collection
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


