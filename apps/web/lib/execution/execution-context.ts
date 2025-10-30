/**
 * Execution Context Manager
 * Manages execution state, console capture, and timeouts for code execution
 */

export interface ExecutionResult {
    output: string[];
    error: string | null;
    duration: number;
    status: 'success' | 'error' | 'timeout';
}

export interface ExecutionOptions {
    timeout?: number; // milliseconds
    captureConsole?: boolean;
}

export class ExecutionContext {
    private startTime: number = 0;
    private outputs: string[] = [];
    private timeoutHandle: number | null = null;

    constructor(private options: ExecutionOptions = {}) {
        this.options = {
            timeout: 5000, // 5 seconds default
            captureConsole: true,
            ...options,
        };
    }

    start(): void {
        this.startTime = Date.now();
        this.outputs = [];
    }

    log(...args: any[]): void {
        if (this.options.captureConsole) {
            this.outputs.push(args.map(arg => this.stringify(arg)).join(' '));
        }
    }

    error(...args: any[]): void {
        if (this.options.captureConsole) {
            this.outputs.push('[ERROR] ' + args.map(arg => this.stringify(arg)).join(' '));
        }
    }

    warn(...args: any[]): void {
        if (this.options.captureConsole) {
            this.outputs.push('[WARN] ' + args.map(arg => this.stringify(arg)).join(' '));
        }
    }

    getDuration(): number {
        return Date.now() - this.startTime;
    }

    getOutputs(): string[] {
        return this.outputs;
    }

    private stringify(value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        if (typeof value === 'function') return value.toString();

        try {
            return JSON.stringify(value, null, 2);
        } catch (e) {
            return String(value);
        }
    }

    createResult(error: string | null = null, status: 'success' | 'error' | 'timeout' = 'success'): ExecutionResult {
        return {
            output: this.getOutputs(),
            error,
            duration: this.getDuration(),
            status,
        };
    }

    setTimeout(callback: () => void): void {
        if (this.options.timeout && typeof window !== 'undefined') {
            this.timeoutHandle = window.setTimeout(callback, this.options.timeout);
        }
    }

    clearTimeout(): void {
        if (this.timeoutHandle !== null && typeof window !== 'undefined') {
            window.clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }
}

