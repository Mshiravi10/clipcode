'use client';

import { SnippetEditor } from '@/components/snippet-editor';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { POPULAR_FRAMEWORKS, SUPPORTED_LANGUAGES } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    language: z.string().min(1, 'Language is required'),
    framework: z.string().optional(),
    description: z.string().max(1000).optional(),
    code: z.string().min(1, 'Code is required'),
    tags: z.string().optional(),
    collectionId: z
        .string()
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface SnippetFormProps {
    initialData?: Partial<FormValues> & { id?: string; isPublic?: boolean };
    mode: 'create' | 'edit';
}

export function SnippetForm({ initialData, mode }: SnippetFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || '',
            language: initialData?.language || 'typescript',
            framework: initialData?.framework || '',
            description: initialData?.description || '',
            code: initialData?.code || '',
            tags: initialData?.tags || '',
            collectionId: initialData?.collectionId || undefined,
            isPublic: initialData?.isPublic || false,
        },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);

        try {
            const endpoint =
                mode === 'create'
                    ? '/api/snippets'
                    : `/api/snippets/${initialData?.id}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            // Convert tags string to array
            const tags = values.tags
                ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    tags,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save snippet');
            }

            const { data } = await response.json();

            toast.success(
                mode === 'create' ? 'Snippet created!' : 'Snippet updated!'
            );

            // Navigate to the snippet detail page
            router.push(`/snippets/${data.slug}`);
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Something went wrong'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="My awesome snippet"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                A descriptive title for your snippet
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={SUPPORTED_LANGUAGES.map((lang) => ({
                                            value: lang,
                                            label: lang.charAt(0).toUpperCase() + lang.slice(1),
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select a language"
                                        searchPlaceholder="Search languages..."
                                        emptyText="No language found."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="framework"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Framework (Optional)</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        // If user selects "none", set to empty string
                                        field.onChange(value === 'none' ? '' : value);
                                    }}
                                    defaultValue={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="No framework" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {POPULAR_FRAMEWORKS.map((fw) => (
                                            <SelectItem key={fw} value={fw}>
                                                {fw}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="What does this snippet do?"
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <SnippetEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    language={form.watch('language')}
                                    height="400px"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="react, hooks, typescript (comma-separated)"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Separate tags with commas
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
                                    Make this snippet public
                                </FormLabel>
                                <FormDescription>
                                    Public snippets can be viewed and copied by anyone in the community
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {mode === 'create' ? 'Create Snippet' : 'Update Snippet'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

