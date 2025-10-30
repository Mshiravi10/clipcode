/**
 * Auto-versioning System
 * Automatically creates versions when snippets are updated
 */

import { diffChars } from 'diff';
import { prisma } from './prisma';

export interface VersioningOptions {
    maxVersions?: number;
    minChangePercentage?: number;
}

const DEFAULT_OPTIONS: VersioningOptions = {
    maxVersions: 50,
    minChangePercentage: 5, // Only version if change is >5%
};

/**
 * Calculate the percentage of change between two code strings
 */
export function calculateChangePercentage(oldCode: string, newCode: string): number {
    const diff = diffChars(oldCode, newCode);
    const totalLength = Math.max(oldCode.length, newCode.length);

    if (totalLength === 0) return 0;

    let changedLength = 0;
    diff.forEach((part) => {
        if (part.added || part.removed) {
            changedLength += part.value.length;
        }
    });

    return (changedLength / totalLength) * 100;
}

/**
 * Check if a new version should be created
 */
export async function shouldCreateVersion(
    snippetId: string,
    newCode: string,
    options: VersioningOptions = DEFAULT_OPTIONS
): Promise<boolean> {
    // Get the latest version
    const latestVersion = await prisma.snippetVersion.findFirst({
        where: { snippetId },
        orderBy: { version: 'desc' },
    });

    if (!latestVersion) {
        return true; // First version
    }

    const changePercentage = calculateChangePercentage(latestVersion.code, newCode);
    return changePercentage >= (options.minChangePercentage || DEFAULT_OPTIONS.minChangePercentage!);
}

/**
 * Create a new snippet version
 */
export async function createVersion(
    snippetId: string,
    userId: string,
    data: {
        title: string;
        code: string;
        description?: string;
        language: string;
        framework?: string;
    }
): Promise<any> {
    // Get current version count
    const versionCount = await prisma.snippetVersion.count({
        where: { snippetId },
    });

    // Create new version
    const version = await prisma.snippetVersion.create({
        data: {
            snippetId,
            version: versionCount + 1,
            title: data.title,
            code: data.code,
            description: data.description || null,
            language: data.language,
            framework: data.framework || null,
            createdBy: userId,
        },
    });

    // Clean up old versions if exceeds max
    await cleanupOldVersions(snippetId, DEFAULT_OPTIONS.maxVersions!);

    return version;
}

/**
 * Auto-create version when snippet is updated
 */
export async function autoVersionSnippet(
    snippetId: string,
    userId: string,
    newData: {
        title: string;
        code: string;
        description?: string;
        language: string;
        framework?: string;
    },
    options: VersioningOptions = DEFAULT_OPTIONS
): Promise<any | null> {
    const shouldVersion = await shouldCreateVersion(snippetId, newData.code, options);

    if (!shouldVersion) {
        return null; // Change too small, skip versioning
    }

    return createVersion(snippetId, userId, newData);
}

/**
 * Remove oldest versions if count exceeds max
 */
export async function cleanupOldVersions(
    snippetId: string,
    maxVersions: number
): Promise<void> {
    const versions = await prisma.snippetVersion.findMany({
        where: { snippetId },
        orderBy: { version: 'desc' },
        select: { id: true },
    });

    if (versions.length > maxVersions) {
        const versionsToDelete = versions.slice(maxVersions);
        await prisma.snippetVersion.deleteMany({
            where: {
                id: { in: versionsToDelete.map((v) => v.id) },
            },
        });
    }
}

/**
 * Get all versions for a snippet
 */
export async function getVersionHistory(
    snippetId: string,
    userId: string
): Promise<any[]> {
    // Verify ownership
    const snippet = await prisma.snippet.findFirst({
        where: { id: snippetId, ownerId: userId },
    });

    if (!snippet) {
        throw new Error('Snippet not found');
    }

    return prisma.snippetVersion.findMany({
        where: { snippetId },
        orderBy: { version: 'desc' },
    });
}

/**
 * Compare two versions
 */
export async function compareVersions(
    versionId1: string,
    versionId2: string,
    userId: string
): Promise<{ version1: any; version2: any; diff: any }> {
    const [version1, version2] = await Promise.all([
        prisma.snippetVersion.findUnique({
            where: { id: versionId1 },
            include: {
                snippet: {
                    select: { ownerId: true },
                },
            },
        }),
        prisma.snippetVersion.findUnique({
            where: { id: versionId2 },
            include: {
                snippet: {
                    select: { ownerId: true },
                },
            },
        }),
    ]);

    if (!version1 || !version2) {
        throw new Error('Version not found');
    }

    if (version1.snippet.ownerId !== userId || version2.snippet.ownerId !== userId) {
        throw new Error('Unauthorized');
    }

    const diff = diffChars(version1.code, version2.code);

    return { version1, version2, diff };
}

/**
 * Restore snippet to a previous version
 */
export async function restoreToVersion(
    snippetId: string,
    versionId: string,
    userId: string
): Promise<any> {
    // Get the version to restore
    const version = await prisma.snippetVersion.findFirst({
        where: {
            id: versionId,
            snippetId,
        },
        include: {
            snippet: {
                select: { ownerId: true },
            },
        },
    });

    if (!version) {
        throw new Error('Version not found');
    }

    if (version.snippet.ownerId !== userId) {
        throw new Error('Unauthorized');
    }

    // Update the snippet with the version's code
    const updatedSnippet = await prisma.snippet.update({
        where: { id: snippetId },
        data: {
            code: version.code,
            title: version.title,
            description: version.description,
            language: version.language,
            framework: version.framework,
        },
    });

    // Create a new version for this restore action
    await createVersion(snippetId, userId, {
        title: version.title,
        code: version.code,
        description: version.description || undefined,
        language: version.language,
        framework: version.framework || undefined,
    });

    return updatedSnippet;
}

