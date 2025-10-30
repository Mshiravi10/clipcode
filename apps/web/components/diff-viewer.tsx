'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewerProps {
    oldValue: string;
    newValue: string;
    oldTitle?: string;
    newTitle?: string;
    language?: string;
}

export function DiffViewer({
    oldValue,
    newValue,
    oldTitle = 'Original',
    newTitle = 'Modified',
    language,
}: DiffViewerProps) {
    const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

    const darkMode = typeof window !== 'undefined' &&
        document.documentElement.classList.contains('dark');

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Code Comparison</CardTitle>
                    <div className="flex items-center gap-2">
                        {language && (
                            <Badge variant="secondary">{language}</Badge>
                        )}
                        <Button
                            variant={viewMode === 'split' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('split')}
                        >
                            Split
                        </Button>
                        <Button
                            variant={viewMode === 'unified' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('unified')}
                        >
                            Unified
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-auto">
                    <ReactDiffViewer
                        oldValue={oldValue}
                        newValue={newValue}
                        splitView={viewMode === 'split'}
                        compareMethod={DiffMethod.CHARS}
                        useDarkTheme={darkMode}
                        leftTitle={oldTitle}
                        rightTitle={newTitle}
                        styles={{
                            variables: {
                                dark: {
                                    diffViewerBackground: '#1e293b',
                                    diffViewerColor: '#e2e8f0',
                                    addedBackground: '#166534',
                                    addedColor: '#dcfce7',
                                    removedBackground: '#991b1b',
                                    removedColor: '#fee2e2',
                                    wordAddedBackground: '#15803d',
                                    wordRemovedBackground: '#b91c1c',
                                    addedGutterBackground: '#14532d',
                                    removedGutterBackground: '#7f1d1d',
                                    gutterBackground: '#0f172a',
                                    gutterColor: '#94a3b8',
                                    codeFoldGutterBackground: '#334155',
                                    codeFoldBackground: '#1e293b',
                                    emptyLineBackground: '#0f172a',
                                },
                                light: {
                                    diffViewerBackground: '#ffffff',
                                    diffViewerColor: '#1e293b',
                                    addedBackground: '#dcfce7',
                                    addedColor: '#166534',
                                    removedBackground: '#fee2e2',
                                    removedColor: '#991b1b',
                                    wordAddedBackground: '#bbf7d0',
                                    wordRemovedBackground: '#fecaca',
                                    addedGutterBackground: '#f0fdf4',
                                    removedGutterBackground: '#fef2f2',
                                    gutterBackground: '#f8fafc',
                                    gutterColor: '#64748b',
                                    codeFoldGutterBackground: '#e2e8f0',
                                    codeFoldBackground: '#f1f5f9',
                                    emptyLineBackground: '#f8fafc',
                                },
                            },
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

