# Pyodide CDN Setup

## Why CDN Instead of npm?

Pyodide was originally installed via npm (`pyodide` package), but this caused webpack bundling issues in Next.js:

```
Module build failed: UnhandledSchemeError: Reading from "node:child_process" is not handled by plugins
```

The Pyodide npm package includes Node.js-specific dependencies that don't work well with Next.js's webpack configuration and shouldn't be bundled for the browser.

## Solution

We now load Pyodide directly from CDN at runtime:

1. **Dynamic Script Loading** (`lib/execution/python-runner.ts`):
   - Pyodide is loaded from `https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js`
   - Script is dynamically injected into the page when needed
   - Only loads in browser environment (client-side only)

2. **Webpack Configuration** (`next.config.mjs`):
   - Node.js built-in modules are marked as `false` in fallback configuration
   - Prevents webpack from trying to bundle `fs`, `net`, `tls`, `child_process`
   - Server-side bundles explicitly exclude pyodide

3. **Type Definitions** (`types/pyodide.d.ts`):
   - Added Window interface extension for `window.loadPyodide`
   - Provides TypeScript support for CDN-loaded Pyodide

## Benefits

- ✅ No webpack bundling issues
- ✅ Smaller bundle size (Pyodide loaded on-demand)
- ✅ Better caching (CDN handles Pyodide separately)
- ✅ Faster initial page load
- ✅ Only downloaded when Python execution is actually used

## Usage

Python execution works exactly the same from the user's perspective. The PythonRunner automatically handles loading Pyodide from CDN on first use:

```typescript
const runner = getPythonRunner();
await runner.execute('print("Hello, World!")');
```

## Version

Currently using: **Pyodide v0.25.0**

To update the version, change the URL in `lib/execution/python-runner.ts`:
```typescript
script.src = 'https://cdn.jsdelivr.net/pyodide/v0.X.X/full/pyodide.js';
// and
indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.X.X/full/'
```

