'use client';

import { cn } from '@/lib/utils';
import { Code2, Download, FileText, FolderOpen, Globe, Home, Tags, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
    {
        label: 'Dashboard',
        href: '/',
        icon: Home,
        adminOnly: false,
    },
    {
        label: 'Snippets',
        href: '/snippets',
        icon: Code2,
        adminOnly: false,
    },
    {
        label: 'Collections',
        href: '/collections',
        icon: FolderOpen,
        adminOnly: false,
    },
    {
        label: 'Tags',
        href: '/tags',
        icon: Tags,
        adminOnly: false,
    },
    {
        label: 'Explore',
        href: '/explore',
        icon: Globe,
        adminOnly: false,
    },
    {
        label: 'Logs',
        href: '/logs',
        icon: FileText,
        adminOnly: true,
    },
    {
        label: 'Import',
        href: '/import',
        icon: Upload,
        adminOnly: false,
    },
    {
        label: 'Export',
        href: '/export',
        icon: Download,
        adminOnly: false,
    },
];

export function DashboardNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkAdmin() {
            if (session?.user?.id) {
                const res = await fetch('/api/user/admin-check');
                const data = await res.json();
                setIsAdmin(data.isAdmin || false);
            }
        }
        checkAdmin();
    }, [session]);

    const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

    return (
        <nav className="hidden md:flex items-center gap-6">
            {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}


