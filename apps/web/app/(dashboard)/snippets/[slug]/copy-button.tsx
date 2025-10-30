'use client';

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopyButton({ snippetId, code }: { snippetId: string; code: string }) {
    async function handleCopy() {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = code;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                } finally {
                    document.body.removeChild(textArea);
                }
            }

            // Track the copy (don't await to avoid blocking)
            fetch(`/api/snippets/${snippetId}/copy`, { method: 'POST' }).catch(() => {
                // Silently fail analytics tracking
            });

            toast.success('Code copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            toast.error('Failed to copy code. Please try selecting and copying manually.');
        }
    }

    return (
        <Button size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
        </Button>
    );
}


