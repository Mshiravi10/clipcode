'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ExportPage() {
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('json');

    async function handleExport() {
        setLoading(true);

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format }),
            });

            if (!response.ok) {
                throw new Error('Failed to export snippets');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snippets-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Export complete!');
        } catch (error) {
            toast.error('Failed to export snippets');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Export Snippets</h1>
                <p className="text-muted-foreground">Export your snippets to JSON or Markdown</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>Choose a format and export all your snippets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Format</label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="markdown">Markdown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Export
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

