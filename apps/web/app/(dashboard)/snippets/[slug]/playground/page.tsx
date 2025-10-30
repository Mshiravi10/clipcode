'use client';

import { ConsoleOutput } from '@/components/playground/console-output';
import { ExecutionControls } from '@/components/playground/execution-controls';
import { HTMLPreview } from '@/components/playground/html-preview';
import { SnippetEditor } from '@/components/snippet-editor';
import { Button } from '@/components/ui/button';
import { getCodeRunner } from '@/lib/execution/runner';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Split from 'react-split';
import { toast } from 'sonner';

interface SnippetData {
    id: string;
    title: string;
    code: string;
    language: string;
    slug: string;
}

export default function PlaygroundPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [snippet, setSnippet] = useState<SnippetData | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);
    const [outputs, setOutputs] = useState<string[]>([]);
    const [duration, setDuration] = useState<number | null>(null);
    const [runner] = useState(() => {
        if (typeof window !== 'undefined') {
            return getCodeRunner();
        }
        return null;
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        async function fetchSnippet() {
            try {
                const response = await fetch(`/api/snippets/${params.slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        router.push('/snippets');
                        return;
                    }
                    throw new Error('Failed to fetch snippet');
                }
                const { data } = await response.json();
                setSnippet(data);
                setCode(data.code);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load snippet');
            } finally {
                setLoading(false);
            }
        }

        fetchSnippet();
    }, [params.slug, session, status, router]);

    const handleRun = async () => {
        if (!runner || !snippet) return;

        setIsExecuting(true);
        setOutputs([]);
        setDuration(null);

        try {
            const result = await runner.execute(code, snippet.language, {
                timeout: 10000,
            });

            setOutputs(result.output);
            setDuration(result.duration);

            if (result.error) {
                toast.error('Execution error: ' + result.error);
            } else if (result.status === 'timeout') {
                toast.error('Execution timed out');
            } else {
                toast.success('Executed successfully');
            }

            // Record execution on server
            await fetch(`/api/snippets/${snippet.id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    input: null,
                }),
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Execution failed';
            setOutputs([`[ERROR] ${message}`]);
            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleStop = () => {
        if (runner) {
            runner.terminate();
            setIsExecuting(false);
            toast.info('Execution stopped');
        }
    };

    const handleClearOutput = () => {
        setOutputs([]);
        setDuration(null);
    };

    const isLanguageSupported = snippet ? runner?.isLanguageSupported(snippet.language) ?? false : false;

    if (status === 'loading' || loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-96 animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    if (!snippet) {
        return null;
    }

    const isHTMLPreview = snippet.language.toLowerCase() === 'html';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/snippets/${params.slug}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Snippet
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{snippet.title}</h1>
                        <p className="text-sm text-muted-foreground">Interactive Playground</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card" style={{ height: 'calc(100vh - 220px)' }}>
                <ExecutionControls
                    isExecuting={isExecuting}
                    language={snippet.language}
                    duration={duration}
                    onRun={handleRun}
                    onStop={handleStop}
                    isSupported={isLanguageSupported}
                />

                <Split
                    className="split"
                    sizes={[50, 50]}
                    minSize={200}
                    gutterSize={8}
                    direction="horizontal"
                    style={{
                        height: 'calc(100vh - 280px)',
                        display: 'flex',
                        width: '100%'
                    }}
                >
                    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                        <SnippetEditor
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            language={snippet.language}
                            height="calc(100vh - 280px)"
                        />
                    </div>

                    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                        {isHTMLPreview ? (
                            <HTMLPreview html={code} onRefresh={handleRun} />
                        ) : (
                            <ConsoleOutput outputs={outputs} onClear={handleClearOutput} />
                        )}
                    </div>
                </Split>
            </div>

            {!isLanguageSupported && (
                <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> Code execution is currently supported for JavaScript, TypeScript, Python, and HTML.
                        Support for {snippet.language} is coming soon!
                    </p>
                </div>
            )}
        </div>
    );
}

