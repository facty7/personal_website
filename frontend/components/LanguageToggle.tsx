'use client';

import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 glow-blue transition-all duration-300"
      aria-label={t('langSwitch')}
    >
      {locale === 'en' ? 'EN' : '中文'}
    </button>
  );
}
