'use client';

import { EmptyState } from '@/components/empty-state';
import { Filters } from '@/components/filters';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { SnippetCard } from '@/components/snippet-card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ExplorePage() {
    const [snippets, setSnippets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [language, setLanguage] = useState('all');
    const [framework, setFramework] = useState('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);

    useEffect(() => {
        fetchPublicSnippets();
        fetchTags();
    }, [searchQuery, language, framework, selectedTags]);

    async function fetchPublicSnippets() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('public', 'true');
            if (searchQuery) params.set('q', searchQuery);
            if (language !== 'all') params.set('language', language);
            if (framework !== 'all') params.set('framework', framework);
            selectedTags.forEach(tag => params.append('tags', tag));

            // We'll need to create a public snippets endpoint or modify existing one
            const response = await fetch(`/api/snippets/public?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch public snippets');
            }

            const data = await response.json();
            setSnippets(data.data || []);
        } catch (error) {
            console.error('Fetch public snippets error:', error);
            toast.error('Failed to fetch public snippets');
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
                    <h1 className="text-3xl font-bold">Explore Public Snippets</h1>
                    <p className="text-muted-foreground">
                        Discover and use code snippets shared by the community
                    </p>
                </div>
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
                                    showOwner={true}
                                    readOnly={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No public snippets found"
                            description="Try adjusting your filters or check back later"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

