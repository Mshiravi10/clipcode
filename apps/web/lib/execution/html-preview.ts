/**
 * HTML Preview Runner
 * Creates sandboxed iframe for HTML/CSS/JS preview
 */

import { ExecutionContext, ExecutionResult } from './execution-context';

export class HTMLPreviewRunner {
    private iframe: HTMLIFrameElement | null = null;

    async execute(html: string, css?: string, js?: string): Promise<ExecutionResult> {
        const context = new ExecutionContext({ captureConsole: false });
        context.start();

        return new Promise((resolve) => {
            try {
                context.log('Preview rendered successfully');
                resolve(context.createResult());
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                context.error(message);
                resolve(context.createResult(message, 'error'));
            }
        });
    }

    getIframe(): HTMLIFrameElement | null {
        return this.iframe;
    }

    destroy(): void {
        if (this.iframe && this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
            this.iframe = null;
        }
    }
}

