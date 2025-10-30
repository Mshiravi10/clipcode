/**
 * Unified Code Runner
 * Routes code execution to appropriate engine based on language
 */

import { ExecutionResult } from './execution-context';
import { HTMLPreviewRunner } from './html-preview';
import { JavaScriptRunner } from './javascript-runner';
import { PythonRunner, getPythonRunner } from './python-runner';

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'html';

export class CodeRunner {
    private jsRunner: JavaScriptRunner;
    private pythonRunner: PythonRunner;
    private htmlRunner: HTMLPreviewRunner;

    constructor() {
        this.jsRunner = new JavaScriptRunner();
        this.pythonRunner = getPythonRunner();
        this.htmlRunner = new HTMLPreviewRunner();
    }

    async execute(
        code: string,
        language: string,
        options = {}
    ): Promise<ExecutionResult> {
        const normalizedLang = language.toLowerCase();

        switch (normalizedLang) {
            case 'javascript':
            case 'js':
            case 'typescript':
            case 'ts':
                return this.jsRunner.execute(code, options);

            case 'python':
            case 'py':
                return this.pythonRunner.execute(code, options);

            case 'html':
                return this.htmlRunner.execute(code);

            default:
                return {
                    output: [],
                    error: `Execution not supported for language: ${language}. Supported languages: JavaScript, TypeScript, Python, HTML`,
                    duration: 0,
                    status: 'error',
                };
        }
    }

    isLanguageSupported(language: string): boolean {
        const normalizedLang = language.toLowerCase();
        return ['javascript', 'js', 'typescript', 'ts', 'python', 'py', 'html'].includes(normalizedLang);
    }

    getSupportedLanguages(): string[] {
        return ['JavaScript', 'TypeScript', 'Python', 'HTML'];
    }

    async initializePython(): Promise<void> {
        await this.pythonRunner.initialize();
    }

    isPythonReady(): boolean {
        return this.pythonRunner.isReady();
    }

    terminate(): void {
        this.jsRunner.terminate();
        this.htmlRunner.destroy();
    }
}

// Export singleton instance for client-side use
let runnerInstance: CodeRunner | null = null;

export function getCodeRunner(): CodeRunner {
    if (typeof window === 'undefined') {
        throw new Error('CodeRunner can only be used in browser environment');
    }

    if (!runnerInstance) {
        runnerInstance = new CodeRunner();
    }
    return runnerInstance;
}

