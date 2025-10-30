'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HTMLPreviewProps {
    html: string;
    onRefresh: () => void;
}

export function HTMLPreview({ html, onRefresh }: HTMLPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [key, setKey] = useState(0);

    // Force iframe refresh when html changes
    useEffect(() => {
        setKey(prev => prev + 1);
    }, [html]);

    // Build complete HTML document
    const buildHTML = (code: string): string => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    ${code}
</body>
</html>
        `.trim();
    };

    const handleRefresh = () => {
        setKey(prev => prev + 1);
        onRefresh();
    };

    return (
        <div className="h-full flex flex-col bg-card border-l">
            <div className="flex items-center justify-between border-b p-3">
                <h3 className="text-sm font-semibold">HTML Preview</h3>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-auto">
                <iframe
                    key={key}
                    ref={iframeRef}
                    className="h-full w-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={buildHTML(html)}
                    title="HTML Preview"
                />
            </div>
        </div>
    );
}

