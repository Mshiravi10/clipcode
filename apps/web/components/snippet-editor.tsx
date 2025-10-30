'use client';

import { Skeleton } from '@/components/ui/skeleton';
import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';

interface SnippetEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language: string;
    readOnly?: boolean;
    height?: string;
}

export function SnippetEditor({
    value,
    onChange,
    language,
    readOnly = false,
    height = '400px',
}: SnippetEditorProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleChange = useCallback(
        (newValue: string | undefined) => {
            onChange(newValue);
        },
        [onChange]
    );

    if (!isMounted) {
        return (
            <div className="rounded-md border">
                <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Editor
                height={height}
                language={language.toLowerCase()}
                value={value}
                onChange={handleChange}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
}


