'use client';

import { SnippetForm } from '@/components/snippet-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NewSnippetPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">New Snippet</h1>
                <p className="text-muted-foreground">
                    Create a new code snippet for your library
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <SnippetForm mode="create" />
                </CardContent>
            </Card>
        </div>
    );
}

