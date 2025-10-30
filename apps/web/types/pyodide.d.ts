// Type definitions for Pyodide loaded from CDN

interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
}

