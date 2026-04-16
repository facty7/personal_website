'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function KaTeXFormula({ formula, displayMode = false, className = '' }: KaTeXFormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode,
      });
    } catch {
      return `<span style="color: #ef4444;">Failed to render formula</span>`;
    }
  }, [formula, displayMode]);

  const Tag = displayMode ? 'div' : 'span';

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
