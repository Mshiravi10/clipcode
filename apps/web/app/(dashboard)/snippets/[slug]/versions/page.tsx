'use client';

import { DiffViewer } from '@/components/diff-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, History, RotateCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Version {
    id: string;
    version: number;
    title: string;
    code: string;
    description: string | null;
    language: string;
    framework: string | null;
    createdBy: string;
    createdAt: string;
}

export default function VersionHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion1, setSelectedVersion1] = useState<Version | null>(null);
    const [selectedVersion2, setSelectedVersion2] = useState<Version | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        fetchVersions();
    }, [params.slug, session, status, router]);

    async function fetchVersions() {
        try {
            const response = await fetch(`/api/snippets/${params.slug}/versions`);
            if (!response.ok) {
                throw new Error('Failed to fetch versions');
            }
            const { data } = await response.json();
            setVersions(data.versions);

            // Auto-select the two most recent versions for comparison
            if (data.versions.length >= 2) {
                setSelectedVersion1(data.versions[1]);
                setSelectedVersion2(data.versions[0]);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load versions');
        } finally {
            setLoading(false);
        }
    }

    async function handleRestore(versionId: string) {
        if (!confirm('Are you sure you want to restore this version? This will create a new version with this code.')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/snippets/${params.slug}/versions/${versionId}/restore`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to restore version');
            }

            toast.success('Version restored successfully');
            router.push(`/snippets/${params.slug}`);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to restore version');
        }
    }

    const handleVersionSelect = (version: Version, slot: 1 | 2) => {
        if (slot === 1) {
            setSelectedVersion1(version);
        } else {
            setSelectedVersion2(version);
        }
        setShowComparison(true);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-96 animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    if (versions.length === 0) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/snippets/${params.slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Snippet
                    </Link>
                </Button>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <History className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No version history</h3>
                        <p className="text-sm text-muted-foreground">
                            Versions will appear here when you edit the snippet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/snippets/${params.slug}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Snippet
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Version History</h1>
                        <p className="text-sm text-muted-foreground">
                            {versions.length} version{versions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                {/* Version List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Versions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {versions.map((version) => {
                            const isSelected1 = selectedVersion1?.id === version.id;
                            const isSelected2 = selectedVersion2?.id === version.id;
                            const isSelected = isSelected1 || isSelected2;

                            return (
                                <div
                                    key={version.id}
                                    className={`rounded-lg border p-3 transition-colors ${isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={version.version === versions[0].version ? 'default' : 'secondary'}>
                                                    v{version.version}
                                                </Badge>
                                                {version.version === versions[0].version && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(version.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant={isSelected1 ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => handleVersionSelect(version, 1)}
                                                className="h-6 px-2 text-xs"
                                            >
                                                A
                                            </Button>
                                            <Button
                                                variant={isSelected2 ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => handleVersionSelect(version, 2)}
                                                className="h-6 px-2 text-xs"
                                            >
                                                B
                                            </Button>
                                        </div>
                                    </div>
                                    {version.version !== versions[0].version && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full"
                                            onClick={() => handleRestore(version.id)}
                                        >
                                            <RotateCcw className="mr-2 h-3 w-3" />
                                            Restore
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Diff Viewer */}
                <div>
                    {showComparison && selectedVersion1 && selectedVersion2 ? (
                        <DiffViewer
                            oldValue={selectedVersion1.code}
                            newValue={selectedVersion2.code}
                            oldTitle={`Version ${selectedVersion1.version}`}
                            newTitle={`Version ${selectedVersion2.version}`}
                            language={selectedVersion2.language}
                        />
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Select versions to compare</h3>
                                <p className="text-sm text-muted-foreground">
                                    Click A and B buttons to select two versions for comparison
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

