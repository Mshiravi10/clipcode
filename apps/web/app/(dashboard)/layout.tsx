import { CommandPalette } from '@/components/command-palette';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserMenu } from '@/components/user-menu';
import { requireAuth } from '@/lib/auth-helpers';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <CommandPalette />
            <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-800">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold">clipcode</h1>
                        <DashboardNav />
                    </div>
                    <div className="flex items-center gap-4">
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                        <UserMenu user={session.user} />
                    </div>
                </div>
            </header>
            <main className="container px-4 py-8">{children}</main>
        </div>
    );
}


