'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Log {
    id: string;
    level: string;
    message: string;
    stackTrace?: string;
    context?: string;
    sessionData?: string;
    userId?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

interface LogsResponse {
    logs: Log[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [level, setLevel] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState<LogsResponse['pagination'] | null>(null);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
            });
            if (level !== 'all') params.append('level', level);
            if (search) params.append('search', search);

            const res = await fetch(`/api/logs?${params}`);
            const data: LogsResponse = await res.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, level, search]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'destructive';
            case 'warn': return 'secondary';
            case 'info': return 'default';
            case 'debug': return 'outline';
            default: return 'default';
        }
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Level', 'Message', 'User', 'Stack Trace'];
        const rows = logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.level,
            log.message,
            log.user?.email || 'N/A',
            log.stackTrace || '',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const cleanupLogs = async () => {
        if (!confirm('Are you sure you want to cleanup logs older than 30 days?')) return;

        try {
            const res = await fetch('/api/logs/cleanup', { method: 'POST' });
            const data = await res.json();
            alert(`Deleted ${data.deletedCount} logs`);
            fetchLogs();
        } catch (error) {
            console.error('Cleanup failed:', error);
            alert('Cleanup failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Error Logs</h1>
                    <p className="text-muted-foreground">View and manage application errors</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={cleanupLogs}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cleanup
                    </Button>
                    <Button variant="outline" onClick={fetchLogs}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CardTitle>Filters</CardTitle>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warn">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {pagination ? `Logs (${pagination.total} total)` : 'Logs'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No logs found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div key={log.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant={getLevelColor(log.level)}>
                                                {log.level}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                            {log.user && (
                                                <span className="text-sm text-muted-foreground">
                                                    {log.user.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm font-medium">{log.message}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        {expandedLog === log.id ? 'Hide Details' : 'Show Details'}
                                    </Button>
                                    {expandedLog === log.id && (
                                        <div className="mt-4 space-y-2">
                                            {log.stackTrace && (
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Stack Trace:</p>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                                        {log.stackTrace}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.context && (
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Context:</p>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                                        {log.context}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.sessionData && (
                                                <div>
                                                    <p className="text-sm font-medium mb-1">Session Data:</p>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                                        {log.sessionData}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

