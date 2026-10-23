import { describe, expect, it } from 'vitest';
import {
    areSimilar,
    calculateSimilarity,
    computeSimHash,
    exactMatchPercentage,
    hammingDistance,
    normalizeCode,
} from './similarity';

describe('similarity utilities', () => {
    it('normalizes whitespace casing and comments', () => {
        expect(normalizeCode('const X = 1; // note\n  RETURN X;')).toBe(
            'const x = 1; return x;'
        );
    });

    it('produces stable hashes for identical code', () => {
        const hash = computeSimHash('const answer = 42;');

        expect(computeSimHash('const answer = 42;')).toBe(hash);
        expect(hammingDistance(hash, hash)).toBe(0);
        expect(calculateSimilarity(hash, hash)).toBe(1);
    });

    it('recognizes identical code and exact normalized matches', () => {
        expect(areSimilar('return value;', 'return value;')).toBe(true);
        expect(exactMatchPercentage('A  B', 'a b')).toBe(1);
    });
});
