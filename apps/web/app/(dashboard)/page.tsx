import { SnippetCard } from '@/components/snippet-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Code2, FolderOpen, Plus, Star, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await requireAuth();

    const [totalSnippets, favoriteCount, recentSnippets, stats] = await Promise.all([
        prisma.snippet.count({ where: { ownerId: session.user.id } }),
        prisma.snippet.count({ where: { ownerId: session.user.id, isFavorite: true } }),
        prisma.snippet.findMany({
            where: { ownerId: session.user.id },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.tag.count(),
            prisma.collection.count({ where: { ownerId: session.user.id } }),
        ]),
    ]);

    const [totalTags, totalCollections] = stats;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {session.user.name}!
                    </p>
                </div>
                <Button asChild>
                    <Link href="/snippets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Snippet
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSnippets}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{favoriteCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tags</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTags}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collections</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCollections}</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Recent Snippets</h2>
                    <Button variant="outline" asChild>
                        <Link href="/snippets">View All</Link>
                    </Button>
                </div>

                {recentSnippets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recentSnippets.map(snippet => (
                            <SnippetCard key={snippet.id} snippet={snippet} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">No snippets yet</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get started by creating your first code snippet
                            </p>
                            <Button asChild>
                                <Link href="/snippets/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Snippet
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


