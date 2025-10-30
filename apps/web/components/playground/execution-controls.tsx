'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Loader2, Play, StopCircle } from 'lucide-react';

interface ExecutionControlsProps {
    isExecuting: boolean;
    language: string;
    duration: number | null;
    onRun: () => void;
    onStop: () => void;
    isSupported: boolean;
}

export function ExecutionControls({
    isExecuting,
    language,
    duration,
    onRun,
    onStop,
    isSupported,
}: ExecutionControlsProps) {
    return (
        <div className="flex items-center gap-4 border-b p-4">
            <div className="flex items-center gap-2">
                <Button
                    onClick={onRun}
                    disabled={isExecuting || !isSupported}
                    size="sm"
                >
                    {isExecuting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Run Code
                        </>
                    )}
                </Button>

                {isExecuting && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onStop}
                    >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Badge variant={isSupported ? 'default' : 'destructive'}>
                    {language}
                </Badge>
                {!isSupported && (
                    <span className="text-xs text-muted-foreground">
                        Execution not supported for this language
                    </span>
                )}
            </div>

            {duration !== null && (
                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {duration}ms
                </div>
            )}
        </div>
    );
}

