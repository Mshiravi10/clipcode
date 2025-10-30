/**
 * JavaScript/TypeScript Runner
 * Executes JavaScript and TypeScript code in a sandboxed Web Worker
 */

import { ExecutionContext, ExecutionResult } from './execution-context';

export class JavaScriptRunner {
    private worker: Worker | null = null;

    async execute(code: string, options = {}): Promise<ExecutionResult> {
        const context = new ExecutionContext(options);
        context.start();

        return new Promise((resolve) => {
            try {
                // Create inline worker with the code
                const workerCode = `
                    const console = {
                        log: (...args) => postMessage({ type: 'log', args }),
                        error: (...args) => postMessage({ type: 'error', args }),
                        warn: (...args) => postMessage({ type: 'warn', args }),
                    };

                    try {
                        ${code}
                    } catch (error) {
                        postMessage({ 
                            type: 'error', 
                            args: [error.message], 
                            stack: error.stack 
                        });
                    }
                    
                    postMessage({ type: 'done' });
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(blob);
                this.worker = new Worker(workerUrl);

                let hasTimedOut = false;

                // Set timeout
                context.setTimeout(() => {
                    hasTimedOut = true;
                    if (this.worker) {
                        this.worker.terminate();
                        this.worker = null;
                    }
                    resolve(context.createResult('Execution timeout exceeded', 'timeout'));
                });

                // Handle messages from worker
                this.worker.onmessage = (e) => {
                    if (hasTimedOut) return;

                    const { type, args, stack } = e.data;

                    switch (type) {
                        case 'log':
                            context.log(...args);
                            break;
                        case 'error':
                            context.error(...args);
                            if (stack) {
                                context.error(stack);
                            }
                            break;
                        case 'warn':
                            context.warn(...args);
                            break;
                        case 'done':
                            context.clearTimeout();
                            if (this.worker) {
                                this.worker.terminate();
                                this.worker = null;
                            }
                            URL.revokeObjectURL(workerUrl);
                            resolve(context.createResult());
                            break;
                    }
                };

                // Handle worker errors
                this.worker.onerror = (error) => {
                    if (hasTimedOut) return;

                    context.clearTimeout();
                    context.error(error.message);
                    if (this.worker) {
                        this.worker.terminate();
                        this.worker = null;
                    }
                    URL.revokeObjectURL(workerUrl);
                    resolve(context.createResult(error.message, 'error'));
                };

            } catch (error) {
                context.clearTimeout();
                const message = error instanceof Error ? error.message : 'Unknown error';
                context.error(message);
                resolve(context.createResult(message, 'error'));
            }
        });
    }

    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

