'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useI18n } from '@/lib/i18n';

const routes = [
  { href: '/workspace', labelKey: 'navWorkspace' },
  { href: '/docs', labelKey: 'navDocs' },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-zinc-100 font-semibold text-sm tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 text-xs font-bold">
              AI
            </div>
            <span className="hidden sm:inline">Research Lab</span>
          </Link>

          <nav className="flex items-center gap-1">
            {routes.map((route) => {
              const isActive =
                pathname === route.href ||
                (route.href !== '/workspace' && pathname?.startsWith(route.href));

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-md bg-zinc-800/70" />
                  )}
                  {t(route.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Language toggle + GitHub */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-200"
            aria-label="GitHub"
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 1.743-.27.501 0 1.006.068 1.471.2 1.453-.287 2.897-.723 3.982-2.187 0 0 .828-.212 1.576.774 0 0 .414 1.201.34 2.082.98-.292 2.003-.447 2.998-.447 1 0 1.968.151 2.895.447.442-.73.34-1.83.34-1.83s.556-1.01 2.008-.774c.926.974 1.356 2.187 1.356 2.187.69.395 1.082 1.09 1.082 2.182 0 3.85-2.34 4.69-4.566 4.938.358.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
