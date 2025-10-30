'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ImportPage() {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to import snippets');
            }

            const data = await response.json();
            toast.success(`Successfully imported ${data.data.imported} snippet(s)`);
            setFile(null);
        } catch (error) {
            toast.error('Failed to import snippets');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Import Snippets</h1>
                <p className="text-muted-foreground">Import snippets from JSON or Markdown files</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>
                        Supported formats: JSON and Markdown (with YAML front-matter)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">File</label>
                            <input
                                type="file"
                                accept=".json,.md"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium"
                            />
                            <p className="text-xs text-muted-foreground">
                                {file ? `Selected: ${file.name}` : 'No file selected'}
                            </p>
                        </div>

                        <Button type="submit" disabled={loading || !file}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>JSON Format</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
                        <code>{`{
  "snippets": [
    {
      "title": "My Snippet",
      "language": "javascript",
      "code": "console.log('Hello')",
      "tags": ["js", "console"]
    }
  ]
}`}</code>
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}

