'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Network, Search, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewId } from './shared';

type EventoShellProps = {
  view: ViewId;
  isOrganizerView: boolean;
  isAuthenticated: boolean;
  user?: { email: string } | null;
  clearAuth: () => void;
  canOpenSystem: boolean;
  navItems: Array<{ id: ViewId; label: string; href: string; icon: typeof Search }>;
  children: ReactNode;
};

export function EventoShell({
  view,
  isOrganizerView,
  isAuthenticated,
  user,
  clearAuth,
  canOpenSystem,
  navItems,
  children,
}: EventoShellProps) {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#ff5a3d] text-white">
                <Ticket className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold">Evento</h1>
                <div className="text-xs text-zinc-500">
                  {isOrganizerView ? 'Organizer workspace' : 'Find events. Book tickets.'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden max-w-[180px] truncate text-sm text-zinc-600 sm:inline">
                    {user.email}
                  </span>
                  <Button variant="outline" onClick={clearAuth}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="bg-[#ff5a3d] text-white hover:bg-[#e8492f]">
                    <Link href="/register">Create account</Link>
                  </Button>
                </div>
              )}
              {canOpenSystem && (
                <Link
                  className={cn(
                    'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950',
                    view === 'ops' && 'theme-hero-active-pill hover:opacity-90',
                  )}
                  href="/ops"
                >
                  <Network className="size-4" />
                  System
                </Link>
              )}
            </div>
          </div>

          <nav className="flex min-w-0 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition',
                    view === item.id
                      ? 'theme-hero-active-pill shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
    </main>
  );
}
