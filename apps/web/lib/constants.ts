// App Configuration
export const APP_NAME = 'clipcode';
export const APP_DESCRIPTION = 'Code Snippet Manager';
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;
export const SIMILARITY_THRESHOLD = 0.3;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMPORT_EXTENSIONS = ['.json', '.md', '.markdown'];
export const ALLOWED_EXPORT_FORMATS = ['json', 'markdown'] as const;

// Programming Languages
export const SUPPORTED_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'java',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'sql',
    'html',
    'css',
    'scss',
    'bash',
    'shell',
    'yaml',
    'json',
    'xml',
    'markdown',
] as const;

// Frameworks
export const POPULAR_FRAMEWORKS = [
    'React',
    'Next.js',
    'Vue',
    'Angular',
    'Svelte',
    'Express',
    'NestJS',
    'Django',
    'Flask',
    'FastAPI',
    'Spring Boot',
    'ASP.NET',
    'Laravel',
    'Rails',
] as const;

// Session & Auth
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
export const SESSION_UPDATE_AGE = 24 * 60 * 60; // 24 hours in seconds

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;

// Encryption
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const PBKDF2_ITERATIONS = 100000;
export const SALT_LENGTH = 32;
export const IV_LENGTH = 16;
export const AUTH_TAG_LENGTH = 16;

// Duplicate Detection
export const SIMHASH_BIT_LENGTH = 64;
export const DEFAULT_DUPLICATE_THRESHOLD = 0.85;

// Audit Log Actions
export const AUDIT_ACTIONS = {
    // Snippet actions
    CREATED_SNIPPET: 'CREATED_SNIPPET',
    UPDATED_SNIPPET: 'UPDATED_SNIPPET',
    DELETED_SNIPPET: 'DELETED_SNIPPET',
    COPIED_SNIPPET: 'COPIED_SNIPPET',
    FAVORITED_SNIPPET: 'FAVORITED_SNIPPET',
    UNFAVORITED_SNIPPET: 'UNFAVORITED_SNIPPET',
    EXECUTED_SNIPPET: 'EXECUTED_SNIPPET',

    // Collection actions
    CREATED_COLLECTION: 'CREATED_COLLECTION',
    UPDATED_COLLECTION: 'UPDATED_COLLECTION',
    DELETED_COLLECTION: 'DELETED_COLLECTION',

    // Tag actions
    CREATED_TAG: 'CREATED_TAG',
    DELETED_TAG: 'DELETED_TAG',

    // Import/Export actions
    IMPORTED_SNIPPETS: 'IMPORTED_SNIPPETS',
    EXPORTED_SNIPPETS: 'EXPORTED_SNIPPETS',

    // Gist actions
    SYNCED_TO_GIST: 'SYNCED_TO_GIST',
    SYNCED_FROM_GIST: 'SYNCED_FROM_GIST',

    // Project actions
    CREATED_PROJECT: 'CREATED_PROJECT',
    UPDATED_PROJECT: 'UPDATED_PROJECT',
    DELETED_PROJECT: 'DELETED_PROJECT',

    // Auth actions
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
} as const;

// Entities
export const ENTITIES = {
    SNIPPET: 'SNIPPET',
    COLLECTION: 'COLLECTION',
    TAG: 'TAG',
    USER: 'USER',
    GIST: 'GIST',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'You must be signed in to perform this action',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Invalid input data',
    INTERNAL_ERROR: 'An unexpected error occurred',
    SNIPPET_NOT_FOUND: 'Snippet not found',
    COLLECTION_NOT_FOUND: 'Collection not found',
    TAG_NOT_FOUND: 'Tag not found',
    DUPLICATE_SLUG: 'A snippet with this slug already exists',
    DUPLICATE_TAG: 'A tag with this name already exists',
    DUPLICATE_COLLECTION: 'A collection with this name already exists',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File is too large',
    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
} as const;

