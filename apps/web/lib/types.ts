import { Prisma } from '@prisma/client';
import { ALLOWED_EXPORT_FORMATS } from './constants';

// Snippet with relations
export type SnippetWithRelations = Prisma.SnippetGetPayload<{
    include: {
        owner: { select: { id: true; name: true; image: true } };
        collection: true;
        tags: {
            include: {
                tag: true;
            };
        };
    };
}>;

// Collection with snippet count
export type CollectionWithCount = Prisma.CollectionGetPayload<{
    include: {
        _count: { select: { snippets: true } };
    };
}>;

// Tag with snippet count
export type TagWithCount = Prisma.TagGetPayload<{
    include: {
        _count: { select: { snippets: true } };
    };
}>;

// Search filters
export interface SearchFilters {
    query?: string;
    language?: string;
    framework?: string;
    tags?: string[];
    favorite?: boolean;
    collectionId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'recent' | 'popular' | 'alphabetical';
    sortOrder?: 'asc' | 'desc';
}

// Pagination
export interface PaginationParams {
    cursor?: string;
    limit?: number;
}

export interface PaginatedResult<T> {
    items: T[];
    nextCursor?: string;
    total: number;
}

// Search result
export interface SearchResult {
    snippets: SnippetWithRelations[];
    nextCursor?: string;
    total: number;
}

// Import/Export
export type ExportFormat = typeof ALLOWED_EXPORT_FORMATS[number];

export interface ExportOptions {
    format: ExportFormat;
    snippetIds?: string[];
}

export interface ImportResult {
    imported: number;
    skipped: number;
    errors: string[];
    snippets: SnippetWithRelations[];
}

// Template rendering
export interface TemplateVariable {
    name: string;
    value: string;
}

export interface RenderOptions {
    variables?: Record<string, string>;
    helpers?: Record<string, Function>;
}

// Encryption
export interface EncryptedData {
    iv: string;
    encrypted: string;
    authTag: string;
    salt: string;
}

export interface EncryptionKey {
    key: Buffer;
    salt: Buffer;
}

// Duplicate detection
export interface SimilarityMatch {
    snippet: SnippetWithRelations;
    similarity: number;
}

// GitHub Gist
export interface GistFile {
    filename: string;
    content: string;
    language?: string;
}

export interface Gist {
    id: string;
    description: string;
    public: boolean;
    files: Record<string, GistFile>;
    created_at: string;
    updated_at: string;
    html_url: string;
}

export interface GistSyncResult {
    synced: number;
    skipped: number;
    errors: string[];
    gists: Gist[];
}

// User preferences
export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    defaultLanguage?: string;
    duplicateThreshold?: number;
    enableEncryption?: boolean;
    gistToken?: string;
    autoSync?: boolean;
}

// Dashboard stats
export interface DashboardStats {
    totalSnippets: number;
    favoriteCount: number;
    collectionCount: number;
    tagCount: number;
    topLanguages: Array<{ language: string; count: number }>;
    topTags: Array<TagWithCount>;
    mostUsed: Array<{
        id: string;
        title: string;
        slug: string;
        usageCount: number;
        language: string;
    }>;
    recentActivity: Array<{
        id: string;
        action: string;
        entity: string;
        entityId: string | null;
        createdAt: Date;
    }>;
}

// Snippet version
export interface SnippetVersion {
    id: string;
    snippetId: string;
    version: number;
    title: string;
    code: string;
    description?: string;
    createdAt: Date;
    createdBy: string;
}

// Command palette item
export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    shortcut?: string;
    icon?: string;
    action: () => void;
    category?: string;
}

