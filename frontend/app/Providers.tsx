'use client';

import { I18nProvider, useI18n } from '@/lib/i18n';
import { useEffect, type ReactNode } from 'react';

function LangSetter() {
  const { locale } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <LangSetter />
      {children}
    </I18nProvider>
  );
}
