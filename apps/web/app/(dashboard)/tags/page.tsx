import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export default async function TagsPage() {
    const session = await requireAuth();

    const tags = await prisma.tag.findMany({
        where: {
            snippets: {
                some: {
                    snippet: {
                        ownerId: session.user.id,
                    },
                },
            },
        },
        include: {
            _count: {
                select: {
                    snippets: {
                        where: {
                            snippet: {
                                ownerId: session.user.id,
                            },
                        },
                    },
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Tags</h1>
                <p className="text-muted-foreground">View and manage your tags</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tags</CardTitle>
                    <CardDescription>
                        {tags.length} tag{tags.length !== 1 ? 's' : ''} in use
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="text-sm py-1 px-3">
                                {tag.name}
                                <span className="ml-2 opacity-70">({tag._count.snippets})</span>
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


