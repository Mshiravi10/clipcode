import { logError } from './error-logger';

let logQueue: Array<{ message: string; error: Error; context?: any }> = [];
let isProcessing = false;
let lastLogTime = 0;
const LOG_THROTTLE_MS = 1000;

async function processLogQueue() {
    if (isProcessing || logQueue.length === 0) return;

    isProcessing = true;
    const now = Date.now();

    if (now - lastLogTime < LOG_THROTTLE_MS) {
        setTimeout(() => {
            isProcessing = false;
            processLogQueue();
        }, LOG_THROTTLE_MS - (now - lastLogTime));
        return;
    }

    const batch = logQueue.splice(0, 10);
    lastLogTime = Date.now();

    for (const item of batch) {
        await logError(item.message, item.error, item.context);
    }

    isProcessing = false;
    if (logQueue.length > 0) {
        processLogQueue();
    }
}

export function logClientError(message: string, error: Error, context?: any) {
    logQueue.push({ message, error, context });
    if (!isProcessing) {
        processLogQueue();
    }
}

