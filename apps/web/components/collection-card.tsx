'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Lock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CollectionCardProps {
    collection: {
        id: string;
        name: string;
        slug: string;
        isPublic?: boolean;
        owner?: {
            id: string;
            name: string | null;
            email: string | null;
        };
        _count: {
            snippets: number;
        };
    };
    showOwner?: boolean;
    readOnly?: boolean;
}

export function CollectionCard({
    collection,
    showOwner = false,
    readOnly = false
}: CollectionCardProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/collections/${collection.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }

            toast.success('Collection deleted');
            router.refresh();
        } catch (error) {
            toast.error('Failed to delete collection');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    return (
        <>
            <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
                <Link href={`/collections/${collection.slug}`}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle>{collection.name}</CardTitle>
                                    {collection.isPublic !== undefined && (
                                        <Badge variant={collection.isPublic ? 'default' : 'secondary'} className="text-xs">
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
                                    )}
                                </div>
                                <CardDescription>
                                    {collection._count.snippets} snippet
                                    {collection._count.snippets !== 1 ? 's' : ''}
                                    {showOwner && collection.owner && (
                                        <> · by {collection.owner.name || collection.owner.email}</>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Link>
                <CardContent>
                    {!readOnly && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/collections/${collection.slug}/edit`);
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{collection.name}"? This action
                            cannot be undone. Snippets in this collection will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

