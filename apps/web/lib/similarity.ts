import crypto from 'crypto';
import { DEFAULT_DUPLICATE_THRESHOLD, SIMHASH_BIT_LENGTH } from './constants';
import { prisma } from './prisma';
import { SimilarityMatch } from './types';

/**
 * Tokenize code into words/features
 */
function tokenize(code: string): string[] {
    // Remove comments
    const withoutComments = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
        .replace(/\/\/.*/g, '') // Single-line comments
        .replace(/#.*/g, ''); // Python-style comments

    // Split into tokens (words, numbers, operators)
    const tokens = withoutComments
        .split(/\s+/)
        .filter((token) => token.length > 0)
        .map((token) => token.toLowerCase().trim());

    return tokens;
}

/**
 * Generate hash for a token
 */
function hashToken(token: string): bigint {
    const hash = crypto.createHash('md5').update(token).digest();
    let result = BigInt(0);
    for (let i = 0; i < 8; i++) {
        result = (result << BigInt(8)) | BigInt(hash[i]);
    }
    return result;
}

/**
 * Compute SimHash for code
 */
export function computeSimHash(code: string): string {
    const tokens = tokenize(code);

    if (tokens.length === 0) {
        return '0';
    }

    // Initialize feature vector
    const features: number[] = new Array(SIMHASH_BIT_LENGTH).fill(0);

    // Process each token
    tokens.forEach((token) => {
        const hash = hashToken(token);

        // For each bit in the hash
        for (let i = 0; i < SIMHASH_BIT_LENGTH; i++) {
            const bit = (hash >> BigInt(i)) & BigInt(1);
            if (bit === BigInt(1)) {
                features[i] += 1;
            } else {
                features[i] -= 1;
            }
        }
    });

    // Convert feature vector to binary hash
    let simhash = BigInt(0);
    for (let i = 0; i < SIMHASH_BIT_LENGTH; i++) {
        if (features[i] > 0) {
            simhash |= BigInt(1) << BigInt(i);
        }
    }

    return simhash.toString();
}

/**
 * Calculate Hamming distance between two SimHashes
 */
export function hammingDistance(hash1: string, hash2: string): number {
    const a = BigInt(hash1);
    const b = BigInt(hash2);
    let xor = a ^ b;
    let distance = 0;

    while (xor > BigInt(0)) {
        distance += Number(xor & BigInt(1));
        xor >>= BigInt(1);
    }

    return distance;
}

/**
 * Calculate similarity score (0-1) between two SimHashes
 */
export function calculateSimilarity(hash1: string, hash2: string): number {
    const distance = hammingDistance(hash1, hash2);
    return 1 - distance / SIMHASH_BIT_LENGTH;
}

/**
 * Check if two codes are similar based on threshold
 */
export function areSimilar(
    code1: string,
    code2: string,
    threshold: number = DEFAULT_DUPLICATE_THRESHOLD
): boolean {
    const hash1 = computeSimHash(code1);
    const hash2 = computeSimHash(code2);
    const similarity = calculateSimilarity(hash1, hash2);
    return similarity >= threshold;
}

/**
 * Find similar snippets for a given code
 */
export async function findSimilarSnippets(
    code: string,
    userId: string,
    options: {
        threshold?: number;
        limit?: number;
        excludeSnippetId?: string;
    } = {}
): Promise<SimilarityMatch[]> {
    const {
        threshold = DEFAULT_DUPLICATE_THRESHOLD,
        limit = 10,
        excludeSnippetId,
    } = options;

    // Compute SimHash for input code
    const inputHash = computeSimHash(code);

    // Fetch all user's snippets
    const snippets = await prisma.snippet.findMany({
        where: {
            ownerId: userId,
            id: excludeSnippetId ? { not: excludeSnippetId } : undefined,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            collection: true,
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    // Calculate similarity for each snippet
    const matches: SimilarityMatch[] = [];

    for (const snippet of snippets) {
        const snippetHash = computeSimHash(snippet.code);
        const similarity = calculateSimilarity(inputHash, snippetHash);

        if (similarity >= threshold) {
            matches.push({
                snippet,
                similarity,
            });
        }
    }

    // Sort by similarity (highest first) and limit results
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches.slice(0, limit);
}

/**
 * Check if code is a duplicate of existing snippets
 */
export async function isDuplicate(
    code: string,
    userId: string,
    threshold: number = DEFAULT_DUPLICATE_THRESHOLD
): Promise<boolean> {
    const similar = await findSimilarSnippets(code, userId, {
        threshold,
        limit: 1,
    });
    return similar.length > 0;
}

/**
 * Get duplicate statistics for a user
 */
export async function getDuplicateStats(userId: string): Promise<{
    totalSnippets: number;
    duplicatePairs: number;
    averageSimilarity: number;
}> {
    const snippets = await prisma.snippet.findMany({
        where: { ownerId: userId },
        select: { id: true, code: true },
    });

    if (snippets.length < 2) {
        return {
            totalSnippets: snippets.length,
            duplicatePairs: 0,
            averageSimilarity: 0,
        };
    }

    let duplicatePairs = 0;
    let totalSimilarity = 0;
    let comparisons = 0;

    // Compare all pairs
    for (let i = 0; i < snippets.length; i++) {
        const hash1 = computeSimHash(snippets[i].code);

        for (let j = i + 1; j < snippets.length; j++) {
            const hash2 = computeSimHash(snippets[j].code);
            const similarity = calculateSimilarity(hash1, hash2);

            totalSimilarity += similarity;
            comparisons++;

            if (similarity >= DEFAULT_DUPLICATE_THRESHOLD) {
                duplicatePairs++;
            }
        }
    }

    return {
        totalSnippets: snippets.length,
        duplicatePairs,
        averageSimilarity: comparisons > 0 ? totalSimilarity / comparisons : 0,
    };
}

/**
 * Normalize code for better similarity detection
 * Removes whitespace, comments, and standardizes formatting
 */
export function normalizeCode(code: string): string {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*/g, '') // Remove single-line comments
        .replace(/#.*/g, '') // Remove Python-style comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .toLowerCase();
}

/**
 * Calculate exact match percentage (for validation)
 */
export function exactMatchPercentage(code1: string, code2: string): number {
    const normalized1 = normalizeCode(code1);
    const normalized2 = normalizeCode(code2);

    if (normalized1 === normalized2) {
        return 1.0;
    }

    // Calculate character-level similarity
    const maxLength = Math.max(normalized1.length, normalized2.length);
    let matches = 0;

    for (let i = 0; i < Math.min(normalized1.length, normalized2.length); i++) {
        if (normalized1[i] === normalized2[i]) {
            matches++;
        }
    }

    return matches / maxLength;
}

