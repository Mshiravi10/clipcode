'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ConsoleOutputProps {
    outputs: string[];
    onClear: () => void;
}

export function ConsoleOutput({ outputs, onClear }: ConsoleOutputProps) {
    return (
        <div className="h-full flex flex-col bg-card border-l">
            <div className="flex items-center justify-between border-b p-3">
                <h3 className="text-sm font-semibold">Console Output</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    disabled={outputs.length === 0}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {outputs.length === 0 ? (
                    <div className="text-muted-foreground italic">
                        No output yet. Run your code to see results.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {outputs.map((output, index) => {
                            const isError = output.startsWith('[ERROR]');
                            const isWarn = output.startsWith('[WARN]');

                            return (
                                <div
                                    key={index}
                                    className={`${isError
                                        ? 'text-red-600 dark:text-red-400'
                                        : isWarn
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-foreground'
                                        }`}
                                >
                                    {output}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

