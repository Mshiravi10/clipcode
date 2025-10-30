'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [collectionId, setCollectionId] = useState<string>('');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            isPublic: false,
        },
    });

    useEffect(() => {
        async function fetchCollection() {
            try {
                // First get collection by slug to find ID
                const response = await fetch(`/api/collections?slug=${params.slug}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch collection');
                }

                const data = await response.json();
                const collections = data.data;

                const collection = collections.find((c: any) => c.slug === params.slug);

                if (!collection) {
                    throw new Error('Collection not found');
                }

                setCollectionId(collection.id);

                // Fetch full collection details
                const detailResponse = await fetch(`/api/collections/${collection.id}`);
                const detailData = await detailResponse.json();

                form.reset({
                    name: detailData.data.name,
                    isPublic: detailData.data.isPublic || false,
                });
            } catch (error) {
                console.error('Fetch collection error:', error);
                toast.error('Failed to load collection');
                router.push('/collections');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCollection();
    }, [params.slug, form, router]);

    async function onSubmit(values: FormValues) {
        if (!collectionId) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/collections/${collectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update collection');
            }

            toast.success('Collection updated successfully!');
            router.push('/collections');
            router.refresh();
        } catch (error) {
            console.error('Update collection error:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to update collection'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Collection</h1>
                <p className="text-muted-foreground">
                    Update your collection settings
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collection Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter collection name..."
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Choose a descriptive name for your collection (max 100
                                            characters)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                disabled={isSubmitting}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Make this collection public
                                            </FormLabel>
                                            <FormDescription>
                                                Public collections can be viewed by anyone. Note that only public snippets within the collection will be visible to others.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/collections')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

