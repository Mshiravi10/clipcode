import { logAudit } from './audit';
import { AUDIT_ACTIONS, ENTITIES } from './constants';
import { prisma } from './prisma';
import { generateUniqueSlug } from './slug';
import { Gist, GistFile, GistSyncResult } from './types';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Fetch Gist from GitHub
 */
export async function fetchGist(gistId: string, token: string): Promise<Gist> {
    const response = await fetch(`${GITHUB_API_URL}/gists/${gistId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Gist: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Fetch all user's Gists from GitHub
 */
export async function fetchAllGists(
    token: string,
    limit: number = 100
): Promise<Gist[]> {
    const response = await fetch(
        `${GITHUB_API_URL}/gists?per_page=${Math.min(limit, 100)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch Gists: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Create Gist on GitHub
 */
export async function createGist(
    files: Record<string, GistFile>,
    description: string,
    isPublic: boolean,
    token: string
): Promise<Gist> {
    const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description,
            public: isPublic,
            files,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create Gist: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Update existing Gist on GitHub
 */
export async function updateGist(
    gistId: string,
    files: Record<string, GistFile>,
    description: string,
    token: string
): Promise<Gist> {
    const response = await fetch(`${GITHUB_API_URL}/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description,
            files,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update Gist: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Delete Gist on GitHub
 */
export async function deleteGist(gistId: string, token: string): Promise<void> {
    const response = await fetch(`${GITHUB_API_URL}/gists/${gistId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete Gist: ${response.statusText}`);
    }
}

/**
 * Push snippet to Gist
 */
export async function pushSnippetToGist(
    snippetId: string,
    userId: string,
    token: string,
    gistId?: string
): Promise<Gist> {
    // Fetch snippet
    const snippet = await prisma.snippet.findFirst({
        where: {
            id: snippetId,
            ownerId: userId,
        },
    });

    if (!snippet) {
        throw new Error('Snippet not found');
    }

    // Prepare file for Gist
    const filename = `${snippet.slug}.${getFileExtension(snippet.language)}`;
    const files: Record<string, GistFile> = {
        [filename]: {
            filename,
            content: snippet.code,
            language: snippet.language,
        },
    };

    const description =
        snippet.description || snippet.title || 'Code snippet from clipcode';

    // Create or update Gist
    let gist: Gist;
    if (gistId) {
        gist = await updateGist(gistId, files, description, token);
    } else {
        gist = await createGist(files, description, false, token);
    }

    // Store Gist ID in snippet metadata (you may want to add a gistId field to schema)
    // For now, we can store it in placeholders or add a new field

    // Audit log
    await logAudit(
        AUDIT_ACTIONS.SYNCED_TO_GIST,
        ENTITIES.GIST,
        gist.id,
        userId,
        {
            snippetId,
            gistUrl: gist.html_url,
        }
    );

    return gist;
}

/**
 * Pull Gist as snippet
 */
export async function pullGistAsSnippet(
    gistId: string,
    userId: string,
    token: string
): Promise<string[]> {
    // Fetch Gist
    const gist = await fetchGist(gistId, token);

    const createdSnippetIds: string[] = [];

    // Create snippet for each file in Gist
    for (const [filename, file] of Object.entries(gist.files)) {
        const language = detectLanguageFromFilename(filename) || file.language || 'plaintext';
        const title = filename.split('.')[0] || 'Untitled';
        const slug = await generateUniqueSlug(title, 'snippet');

        const snippet = await prisma.snippet.create({
            data: {
                title,
                slug,
                language,
                description: gist.description || undefined,
                code: file.content,
                ownerId: userId,
            },
        });

        createdSnippetIds.push(snippet.id);

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.SYNCED_FROM_GIST,
            ENTITIES.GIST,
            gistId,
            userId,
            {
                snippetId: snippet.id,
                filename,
            }
        );
    }

    return createdSnippetIds;
}

/**
 * Pull all Gists as snippets
 */
export async function pullAllGists(
    userId: string,
    token: string,
    limit: number = 20
): Promise<GistSyncResult> {
    try {
        const gists = await fetchAllGists(token, limit);

        let synced = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const gist of gists) {
            try {
                await pullGistAsSnippet(gist.id, userId, token);
                synced++;
            } catch (error) {
                skipped++;
                errors.push(
                    `Failed to import Gist ${gist.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        return {
            synced,
            skipped,
            errors,
            gists,
        };
    } catch (error) {
        throw new Error(
            `Failed to pull Gists: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Sync snippet with Gist (bidirectional)
 */
export async function syncSnippetWithGist(
    snippetId: string,
    gistId: string,
    userId: string,
    token: string
): Promise<{ action: 'pushed' | 'pulled' | 'conflict'; snippet?: any; gist?: Gist }> {
    // Fetch both
    const snippet = await prisma.snippet.findFirst({
        where: {
            id: snippetId,
            ownerId: userId,
        },
    });

    if (!snippet) {
        throw new Error('Snippet not found');
    }

    const gist = await fetchGist(gistId, token);

    // Compare timestamps
    const snippetUpdated = new Date(snippet.updatedAt);
    const gistUpdated = new Date(gist.updated_at);

    if (snippetUpdated > gistUpdated) {
        // Push to Gist
        const updatedGist = await pushSnippetToGist(snippetId, userId, token, gistId);
        return { action: 'pushed', gist: updatedGist };
    } else if (gistUpdated > snippetUpdated) {
        // Pull from Gist (update snippet)
        const firstFile = Object.values(gist.files)[0];

        if (firstFile) {
            const updatedSnippet = await prisma.snippet.update({
                where: { id: snippetId },
                data: {
                    code: firstFile.content,
                    description: gist.description || snippet.description,
                },
            });

            await logAudit(
                AUDIT_ACTIONS.SYNCED_FROM_GIST,
                ENTITIES.GIST,
                gistId,
                userId,
                {
                    snippetId,
                }
            );

            return { action: 'pulled', snippet: updatedSnippet };
        }
    }

    // No changes or conflict
    return { action: 'conflict', snippet, gist };
}

/**
 * Get file extension for language
 */
function getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        java: 'java',
        csharp: 'cs',
        go: 'go',
        rust: 'rs',
        php: 'php',
        ruby: 'rb',
        swift: 'swift',
        kotlin: 'kt',
        sql: 'sql',
        html: 'html',
        css: 'css',
        scss: 'scss',
        bash: 'sh',
        shell: 'sh',
        yaml: 'yaml',
        json: 'json',
        xml: 'xml',
        markdown: 'md',
    };

    return extensions[language.toLowerCase()] || 'txt';
}

/**
 * Detect language from filename
 */
function detectLanguageFromFilename(filename: string): string | null {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (!ext) return null;

    const languageMap: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        java: 'java',
        cs: 'csharp',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        swift: 'swift',
        kt: 'kotlin',
        sql: 'sql',
        html: 'html',
        css: 'css',
        scss: 'scss',
        sh: 'bash',
        yaml: 'yaml',
        yml: 'yaml',
        json: 'json',
        xml: 'xml',
        md: 'markdown',
    };

    return languageMap[ext] || null;
}

