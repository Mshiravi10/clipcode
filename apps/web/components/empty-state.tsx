import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
            {actionLabel && actionHref && (
                <Button asChild className="mt-4">
                    <Link href={actionHref}>
                        <Plus className="mr-2 h-4 w-4" />
                        {actionLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}


