import { describe, expect, it } from 'vitest';
import {
    extractVariables,
    renderTemplate,
    renderTemplatePreview,
    validateTemplate,
} from './template';

describe('template utilities', () => {
    it('extracts each variable once', () => {
        expect(extractVariables('{{ name }} {{ name | upper }} {{ user_id }}')).toEqual([
            'name',
            'user_id',
        ]);
    });

    it('renders custom filters', async () => {
        await expect(renderTemplate('{{ name | pascal }}', { name: 'clip code' }))
            .resolves.toBe('ClipCode');
    });

    it('creates useful preview values', async () => {
        await expect(renderTemplatePreview('{{ projectName }} {{ itemCount }}'))
            .resolves.toBe('ExampleName 42');
    });

    it('reports valid templates', async () => {
        await expect(validateTemplate('{{ value | upper }}')).resolves.toEqual({ valid: true });
    });
});
