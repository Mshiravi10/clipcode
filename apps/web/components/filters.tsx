'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    language: string;
    onLanguageChange: (value: string) => void;
    framework: string;
    onFrameworkChange: (value: string) => void;
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
    availableTags: Array<{ slug: string; name: string }>;
    onReset: () => void;
}

export function Filters({
    searchQuery,
    onSearchChange,
    language,
    onLanguageChange,
    framework,
    onFrameworkChange,
    selectedTags,
    onTagToggle,
    availableTags,
    onReset,
}: FiltersProps) {
    const languages = [
        'JavaScript',
        'TypeScript',
        'Python',
        'Java',
        'C#',
        'Go',
        'Rust',
        'PHP',
        'Ruby',
        'SQL',
        'GraphQL',
    ];

    const frameworks = [
        'React',
        'Next.js',
        'Vue',
        'Angular',
        'Node.js',
        'Express',
        'Django',
        'Flask',
        '.NET',
        'Spring Boot',
        'Laravel',
    ];

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                        id="search"
                        placeholder="Search snippets..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={onLanguageChange}>
                        <SelectTrigger id="language">
                            <SelectValue placeholder="All languages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All languages</SelectItem>
                            {languages.map(lang => (
                                <SelectItem key={lang} value={lang.toLowerCase()}>
                                    {lang}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Select value={framework} onValueChange={onFrameworkChange}>
                        <SelectTrigger id="framework">
                            <SelectValue placeholder="All frameworks" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All frameworks</SelectItem>
                            {frameworks.map(fw => (
                                <SelectItem key={fw} value={fw.toLowerCase()}>
                                    {fw}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                            const isSelected = selectedTags.includes(tag.slug);
                            return (
                                <Badge
                                    key={tag.slug}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => onTagToggle(tag.slug)}
                                >
                                    {tag.name}
                                    {isSelected && <X className="ml-1 h-3 w-3" />}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


