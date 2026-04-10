'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Container from './Container';
import ProfileWidget from './ProfileWidget';
import ThemeToggle from '../ui/themetoggle';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  const avatarSrc = user?.picture;
  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (pathname?.startsWith('/setting') || pathname?.startsWith('/settings')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            Velocity
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/deployment" className="hover:text-blue-600">
              Deployment
            </Link>
            <Link href="/deployed" className="hover:text-blue-600">
              Deployed
            </Link>
            <Link href="/setting" className="hover:text-blue-600">
              Setting
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </nav>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <div className="hidden md:block">
            <ProfileWidget />
          </div>
          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <Container className="py-4 space-y-3">
            {!isLoading && user && (
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-(--border-default)] bg-(--surface-card)] p-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-(--border-default)] bg-(--surface-card-muted)]">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-(--text-strong)]">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--text-strong)]">{user.name || '—'}</p>
                  <p className="truncate text-xs text-(--text-muted)]">{user.email || '—'}</p>
                </div>
              </div>
            )}

            <Link href="/" onClick={() => setOpen(false)} className="block">
              Home
            </Link>
            <Link href="/deployment" onClick={() => setOpen(false)} className="block">
              Deployment
            </Link>
            <Link href="/deployed" onClick={() => setOpen(false)} className="block">
              Deployed
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="block">
              Contact
            </Link>
            <Link href="/setting" onClick={() => setOpen(false)} className="block">
              Profile
            </Link>
            <Link href="/setting" onClick={() => setOpen(false)} className="block">
              Setting
            </Link>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
