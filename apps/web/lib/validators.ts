import { z } from 'zod';

export const createSnippetSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    language: z.string().min(1, 'Language is required'),
    framework: z.string().optional(),
    description: z.string().max(1000).optional(),
    code: z.string().min(1, 'Code is required'),
    placeholders: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    collectionId: z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val === '' || !val ? null : val)),
    isPublic: z.boolean().optional().default(false),
});

export const updateSnippetSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    language: z.string().min(1).optional(),
    framework: z.string().optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    code: z.string().min(1).optional(),
    placeholders: z.array(z.string()).optional().nullable(),
    tags: z.array(z.string()).optional(),
    collectionId: z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val === '' || !val ? null : val)),
    isFavorite: z.boolean().optional(),
    isPublic: z.boolean().optional(),
});

export const searchSnippetsSchema = z.object({
    q: z.string().optional(),
    language: z.string().optional(),
    framework: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    limit: z.number().int().positive().max(100).optional().default(20),
    cursor: z.string().optional(),
});

export const createTagSchema = z.object({
    name: z.string().min(1).max(50),
});

export const createCollectionSchema = z.object({
    name: z.string().min(1).max(100),
    isPublic: z.boolean().optional().default(false),
});

export const updateCollectionSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    isPublic: z.boolean().optional(),
});

export const importSnippetsSchema = z.object({
    snippets: z.array(
        z.object({
            title: z.string(),
            language: z.string(),
            framework: z.string().optional(),
            description: z.string().optional(),
            code: z.string(),
            tags: z.array(z.string()).optional(),
        })
    ),
});

// Export schemas
export const exportSnippetsSchema = z.object({
    format: z.enum(['json', 'markdown']),
    snippetIds: z.array(z.string()).optional(),
});

// Template rendering
export const renderTemplateSchema = z.object({
    variables: z.record(z.string()).optional(),
});

// User preferences
export const updatePreferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    defaultLanguage: z.string().optional(),
    duplicateThreshold: z.number().min(0).max(1).optional(),
    enableEncryption: z.boolean().optional(),
    gistToken: z.string().optional(),
    autoSync: z.boolean().optional(),
});

// Gist sync
export const syncGistSchema = z.object({
    gistId: z.string().optional(),
    snippetId: z.string().optional(),
});

export const pullGistsSchema = z.object({
    limit: z.number().int().positive().max(100).optional().default(20),
});

// Similarity search
export const findSimilarSchema = z.object({
    threshold: z.number().min(0).max(1).optional(),
    limit: z.number().int().positive().max(50).optional().default(10),
});

// Snippet versioning
export const createVersionSchema = z.object({
    snippetId: z.string(),
    title: z.string(),
    code: z.string(),
    description: z.string().optional(),
});

export const restoreVersionSchema = z.object({
    versionId: z.string(),
});

// Type exports
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type SearchSnippetsInput = z.infer<typeof searchSnippetsSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type ImportSnippetsInput = z.infer<typeof importSnippetsSchema>;
export type ExportSnippetsInput = z.infer<typeof exportSnippetsSchema>;
export type RenderTemplateInput = z.infer<typeof renderTemplateSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type SyncGistInput = z.infer<typeof syncGistSchema>;
export type PullGistsInput = z.infer<typeof pullGistsSchema>;
export type FindSimilarInput = z.infer<typeof findSimilarSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type RestoreVersionInput = z.infer<typeof restoreVersionSchema>;


