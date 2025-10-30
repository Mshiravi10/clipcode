import slugify from 'slugify';
import { prisma } from './prisma';

export async function generateUniqueSlug(
    title: string,
    type: 'snippet' | 'collection' | 'tag' = 'snippet'
): Promise<string> {
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await checkSlugExists(slug, type);
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

async function checkSlugExists(slug: string, type: 'snippet' | 'collection' | 'tag'): Promise<boolean> {
    const count = await prisma[type].count({
        where: { slug },
    });
    return count > 0;
}

export function createSlug(text: string): string {
    return slugify(text, {
        lower: true,
        strict: true,
        trim: true,
    });
}


