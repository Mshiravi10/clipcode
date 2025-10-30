/**
 * Python Runner
 * Executes Python code using Pyodide in the browser
 */

import { ExecutionContext, ExecutionResult } from './execution-context';

export class PythonRunner {
    private pyodide: any = null;
    private loading: boolean = false;

    async initialize(): Promise<void> {
        if (typeof window === 'undefined') {
            throw new Error('Pyodide can only run in browser environment');
        }

        if (this.pyodide) return;
        if (this.loading) {
            // Wait for initialization to complete
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.pyodide || !this.loading) {
                        clearInterval(checkInterval);
                        resolve(null);
                    }
                }, 100);
            });
            return;
        }

        this.loading = true;
        try {
            // Load Pyodide from CDN directly (avoid webpack bundling issues)
            if (!window.loadPyodide) {
                // Dynamically load Pyodide script
                await this.loadPyodideScript();
            }

            // @ts-ignore - Pyodide loaded from CDN
            this.pyodide = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
            });
        } catch (error) {
            throw new Error('Failed to load Pyodide: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            this.loading = false;
        }
    }

    private async loadPyodideScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Pyodide script'));
            document.head.appendChild(script);
        });
    }

    async execute(code: string, options = {}): Promise<ExecutionResult> {
        const context = new ExecutionContext(options);
        context.start();

        try {
            // Initialize Pyodide if not already done
            await this.initialize();

            if (!this.pyodide) {
                throw new Error('Pyodide not initialized');
            }

            // Redirect Python stdout/stderr to capture output
            const captureCode = `
import sys
import io

class OutputCapture(io.StringIO):
    def __init__(self, callback):
        super().__init__()
        self.callback = callback
    
    def write(self, s):
        if s and s != '\\n':
            self.callback(s)
        return len(s)

output_list = []
sys.stdout = OutputCapture(lambda x: output_list.append(x))
sys.stderr = OutputCapture(lambda x: output_list.append('[ERROR] ' + x))
            `;

            await this.pyodide.runPythonAsync(captureCode);

            // Execute user code
            await this.pyodide.runPythonAsync(code);

            // Get captured output
            const outputs = this.pyodide.globals.get('output_list').toJs();
            outputs.forEach((output: string) => {
                if (output.startsWith('[ERROR]')) {
                    context.error(output.substring(8));
                } else {
                    context.log(output);
                }
            });

            return context.createResult();

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Python error';
            context.error(message);
            return context.createResult(message, 'error');
        }
    }

    isReady(): boolean {
        return this.pyodide !== null;
    }
}

// Singleton instance
let pythonRunnerInstance: PythonRunner | null = null;

export function getPythonRunner(): PythonRunner {
    if (!pythonRunnerInstance) {
        pythonRunnerInstance = new PythonRunner();
    }
    return pythonRunnerInstance;
}

