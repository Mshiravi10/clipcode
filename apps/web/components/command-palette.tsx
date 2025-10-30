'use client';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Code2,
    FolderOpen,
    Github,
    Heart,
    Home,
    Import,
    Plus,
    Search,
    Settings,
    Tag,
    Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Command {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
    category: string;
}

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Toggle command palette with ⌘K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const commands: Command[] = [
        // Navigation
        {
            id: 'nav-home',
            label: 'Go to Dashboard',
            icon: <Home className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/');
                setOpen(false);
            },
            keywords: ['home', 'dashboard'],
            category: 'Navigation',
        },
        {
            id: 'nav-snippets',
            label: 'Go to Snippets',
            icon: <Code2 className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/snippets');
                setOpen(false);
            },
            keywords: ['snippets', 'code'],
            category: 'Navigation',
        },
        {
            id: 'nav-collections',
            label: 'Go to Collections',
            icon: <FolderOpen className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/collections');
                setOpen(false);
            },
            keywords: ['collections', 'folders'],
            category: 'Navigation',
        },
        {
            id: 'nav-tags',
            label: 'Go to Tags',
            icon: <Tag className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/tags');
                setOpen(false);
            },
            keywords: ['tags', 'labels'],
            category: 'Navigation',
        },
        {
            id: 'nav-import',
            label: 'Go to Import',
            icon: <Import className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/import');
                setOpen(false);
            },
            keywords: ['import', 'upload'],
            category: 'Navigation',
        },
        {
            id: 'nav-export',
            label: 'Go to Export',
            icon: <Upload className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/export');
                setOpen(false);
            },
            keywords: ['export', 'download'],
            category: 'Navigation',
        },

        // Actions
        {
            id: 'action-new-snippet',
            label: 'Create New Snippet',
            description: 'Add a new code snippet',
            icon: <Plus className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/snippets/new');
                setOpen(false);
            },
            keywords: ['new', 'create', 'add', 'snippet'],
            category: 'Actions',
        },
        {
            id: 'action-search',
            label: 'Search Snippets',
            description: 'Search through your snippets',
            icon: <Search className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/snippets');
                setOpen(false);
                // Focus search input after navigation
                setTimeout(() => {
                    const searchInput = document.querySelector(
                        'input[type="search"]'
                    ) as HTMLInputElement;
                    searchInput?.focus();
                }, 100);
            },
            keywords: ['search', 'find', 'filter'],
            category: 'Actions',
        },

        // Features
        {
            id: 'feature-favorites',
            label: 'View Favorites',
            description: 'Show your favorite snippets',
            icon: <Heart className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/snippets?favorite=true');
                setOpen(false);
            },
            keywords: ['favorites', 'starred', 'bookmarks'],
            category: 'Features',
        },
        {
            id: 'feature-gist-sync',
            label: 'Sync with GitHub Gists',
            description: 'Import or export to GitHub Gists',
            icon: <Github className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/settings/gist');
                setOpen(false);
            },
            keywords: ['gist', 'github', 'sync'],
            category: 'Features',
        },

        // Settings
        {
            id: 'settings-encryption',
            label: 'Encryption Settings',
            description: 'Manage snippet encryption',
            icon: <Settings className="mr-2 h-4 w-4" />,
            action: () => {
                router.push('/settings/encryption');
                setOpen(false);
            },
            keywords: ['encryption', 'security', 'settings'],
            category: 'Settings',
        },
    ];

    // Group commands by category
    const groupedCommands = commands.reduce((acc, command) => {
        if (!acc[command.category]) {
            acc[command.category] = [];
        }
        acc[command.category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(groupedCommands).map(([category, cmds], index) => (
                    <div key={category}>
                        <CommandGroup heading={category}>
                            {cmds.map((command) => (
                                <CommandItem
                                    key={command.id}
                                    onSelect={command.action}
                                    className="cursor-pointer"
                                >
                                    {command.icon}
                                    <div className="flex flex-col">
                                        <span>{command.label}</span>
                                        {command.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {command.description}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {index < Object.keys(groupedCommands).length - 1 && (
                            <CommandSeparator />
                        )}
                    </div>
                ))}
            </CommandList>
        </CommandDialog>
    );
}

