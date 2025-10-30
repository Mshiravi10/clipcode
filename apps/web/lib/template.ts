import { Liquid } from 'liquidjs';
import slugify from 'slugify';

// Initialize Liquid engine
const liquid = new Liquid({
    strictFilters: false,
    strictVariables: false,
});

// Register custom filters/helpers
liquid.registerFilter('slug', (input: string) => {
    return slugify(input, { lower: true, strict: true });
});

liquid.registerFilter('pascal', (input: string) => {
    return input
        .split(/[\s_-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
});

liquid.registerFilter('camel', (input: string) => {
    const pascal = input
        .split(/[\s_-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

liquid.registerFilter('kebab', (input: string) => {
    return slugify(input, { lower: true, strict: true });
});

liquid.registerFilter('snake', (input: string) => {
    return input
        .replace(/\s+/g, '_')
        .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        .replace(/^_/, '')
        .toLowerCase();
});

liquid.registerFilter('upper', (input: string) => {
    return input.toUpperCase();
});

liquid.registerFilter('lower', (input: string) => {
    return input.toLowerCase();
});

liquid.registerFilter('title', (input: string) => {
    return input
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
});

liquid.registerFilter('now', () => {
    return new Date().toISOString();
});

liquid.registerFilter('date', (input: string, format: string = 'YYYY-MM-DD') => {
    const date = new Date(input);
    // Basic date formatting
    return date.toISOString().split('T')[0];
});

liquid.registerFilter('guid', () => {
    return crypto.randomUUID();
});

liquid.registerFilter('uuid', () => {
    return crypto.randomUUID();
});

liquid.registerFilter('timestamp', () => {
    return Date.now();
});

/**
 * Extract variables from template code
 * Looks for Liquid template syntax: {{ variable }}, {% if variable %}, etc.
 */
export function extractVariables(template: string): string[] {
    const variables = new Set<string>();

    // Match {{ variable }} and {{ variable | filter }}
    const simpleVarRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\|[^}]*)?\}\}/g;
    let match;

    while ((match = simpleVarRegex.exec(template)) !== null) {
        variables.add(match[1]);
    }

    // Match {% if variable %}, {% for item in variable %}, etc.
    const controlRegex = /\{%\s*(?:if|unless|for|assign)\s+(?:.*?\s+in\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/g;

    while ((match = controlRegex.exec(template)) !== null) {
        variables.add(match[1]);
    }

    // Filter out common Liquid keywords
    const keywords = ['true', 'false', 'nil', 'null', 'empty', 'blank'];
    return Array.from(variables).filter((v) => !keywords.includes(v.toLowerCase()));
}

/**
 * Render template with variables
 */
export async function renderTemplate(
    template: string,
    variables: Record<string, any> = {}
): Promise<string> {
    try {
        return await liquid.parseAndRender(template, variables);
    } catch (error) {
        throw new Error(`Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validate template syntax
 */
export async function validateTemplate(template: string): Promise<{ valid: boolean; error?: string }> {
    try {
        await liquid.parse(template);
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid template syntax',
        };
    }
}

/**
 * Get available filters
 */
export function getAvailableFilters(): string[] {
    return [
        'slug',
        'pascal',
        'camel',
        'kebab',
        'snake',
        'upper',
        'lower',
        'title',
        'now',
        'date',
        'guid',
        'uuid',
        'timestamp',
        // Built-in Liquid filters
        'abs',
        'append',
        'capitalize',
        'ceil',
        'compact',
        'concat',
        'default',
        'divided_by',
        'downcase',
        'escape',
        'first',
        'floor',
        'join',
        'last',
        'lstrip',
        'map',
        'minus',
        'modulo',
        'newline_to_br',
        'plus',
        'prepend',
        'remove',
        'remove_first',
        'replace',
        'replace_first',
        'reverse',
        'round',
        'rstrip',
        'size',
        'slice',
        'sort',
        'split',
        'strip',
        'strip_html',
        'strip_newlines',
        'times',
        'truncate',
        'truncatewords',
        'uniq',
        'upcase',
        'url_encode',
        'url_decode',
    ];
}

/**
 * Render template with example values for preview
 */
export async function renderTemplatePreview(template: string): Promise<string> {
    const variables = extractVariables(template);
    const exampleValues: Record<string, string> = {};

    // Generate example values
    variables.forEach((variable) => {
        const lowerVar = variable.toLowerCase();

        if (lowerVar.includes('name')) {
            exampleValues[variable] = 'ExampleName';
        } else if (lowerVar.includes('id')) {
            exampleValues[variable] = '12345';
        } else if (lowerVar.includes('date') || lowerVar.includes('time')) {
            exampleValues[variable] = new Date().toISOString();
        } else if (lowerVar.includes('email')) {
            exampleValues[variable] = 'user@example.com';
        } else if (lowerVar.includes('url') || lowerVar.includes('link')) {
            exampleValues[variable] = 'https://example.com';
        } else if (lowerVar.includes('count') || lowerVar.includes('number')) {
            exampleValues[variable] = '42';
        } else {
            exampleValues[variable] = `${variable}Value`;
        }
    });

    return renderTemplate(template, exampleValues);
}

