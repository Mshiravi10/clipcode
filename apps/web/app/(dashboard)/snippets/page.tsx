'use client';

import { EmptyState } from '@/components/empty-state';
import { Filters } from '@/components/filters';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { SnippetCard } from '@/components/snippet-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [language, setLanguage] = useState('all');
    const [framework, setFramework] = useState('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);

    useEffect(() => {
        fetchSnippets();
        fetchTags();
    }, [searchQuery, language, framework, selectedTags]);

    async function fetchSnippets() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (language !== 'all') params.set('language', language);
            if (framework !== 'all') params.set('framework', framework);
            selectedTags.forEach(tag => params.append('tags', tag));

            const response = await fetch(`/api/snippets?${params}`);
            const data = await response.json();
            setSnippets(data.data.snippets || []);
        } catch (error) {
            toast.error('Failed to fetch snippets');
        } finally {
            setLoading(false);
        }
    }

    async function fetchTags() {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch tags');
        }
    }

    async function handleCopy(snippet: any) {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(snippet.code);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = snippet.code;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } finally {
                    document.body.removeChild(textArea);
                }
            }

            // Track the copy (don't await to avoid blocking)
            fetch(`/api/snippets/${snippet.id}/copy`, { method: 'POST' }).catch(() => {
                // Silently fail analytics tracking
            });

            toast.success('Code copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            toast.error('Failed to copy code. Please try selecting and copying manually.');
        }
    }

    async function handleToggleFavorite(snippet: any) {
        try {
            const response = await fetch(`/api/favorite/${snippet.id}`, { method: 'POST' });
            const data = await response.json();
            setSnippets(prev =>
                prev.map(s =>
                    s.id === snippet.id ? { ...s, isFavorite: data.data.isFavorite } : s
                )
            );
            toast.success(data.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to toggle favorite');
        }
    }

    function handleTagToggle(tag: string) {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }

    function handleReset() {
        setSearchQuery('');
        setLanguage('all');
        setFramework('all');
        setSelectedTags([]);
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Snippets</h1>
                    <p className="text-muted-foreground">Manage your code snippets</p>
                </div>
                <Button asChild>
                    <Link href="/snippets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Snippet
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <aside>
                    <Filters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        language={language}
                        onLanguageChange={setLanguage}
                        framework={framework}
                        onFrameworkChange={setFramework}
                        selectedTags={selectedTags}
                        onTagToggle={handleTagToggle}
                        availableTags={availableTags}
                        onReset={handleReset}
                    />
                </aside>

                <div>
                    {loading ? (
                        <LoadingSkeleton />
                    ) : snippets.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {snippets.map(snippet => (
                                <SnippetCard
                                    key={snippet.id}
                                    snippet={snippet}
                                    onCopy={() => handleCopy(snippet)}
                                    onToggleFavorite={() => handleToggleFavorite(snippet)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No snippets found"
                            description="Try adjusting your filters or create a new snippet"
                            actionLabel="Create Snippet"
                            actionHref="/snippets/new"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}


