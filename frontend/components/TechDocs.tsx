'use client';

import { useState } from 'react';
import { KaTeXFormula } from '@/components/KaTeXFormula';
import { useI18n } from '@/lib/i18n';

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors"
      >
        <span className="font-medium text-zinc-200">{title}</span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          {children}
        </div>
      )}
    </div>
  );
}

export function TechDocs() {
  const { t } = useI18n();

  return (
    <div className="glass rounded-lg glow-blue animate-fade-in">
      <div className="p-5">
        <h3 className="text-lg font-bold text-zinc-100 mb-4">{t('techDocsTitle')}</h3>

        <div className="space-y-3">
          {/* SR3 Diffusion Model */}
          <Section title={t('sr3DiffusionTitle')} defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3ForwardProcess')}</h4>
                <KaTeXFormula formula="q(x_t | x_0) = \\mathcal{N}(x_t; \\sqrt{\\bar{\\alpha}_t} x_0, (1 - \\bar{\\alpha}_t)\\mathbf{I})" displayMode />
              </div>
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3ReverseProcess')}</h4>
                <KaTeXFormula formula="p_\\theta(x_{t-1} | x_t) = \\mathcal{N}(x_{t-1}; \\mu_\\theta(x_t, t), \\Sigma_\\theta(x_t, t))" displayMode />
              </div>
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3Derivation')}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3DerivationText')}</p>
              </div>
            </div>
          </Section>

          {/* 3DGS */}
          <Section title={t('threeGSTitle')} defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSRendering')}</h4>
                <KaTeXFormula formula="C(\\mathbf{p}) = \\sum_{i \\in N} c_i \\, \\alpha_i \\prod_{j=1}^{i-1} (1 - \\alpha_j)" displayMode />
              </div>
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSSphericalHarmonics')}</h4>
                <KaTeXFormula formula="\\text{Color}(\\mathbf{d}) = \\sum_{l=0}^{L} \\sum_{m=-l}^{l} c_{lm} \\, Y_{lm}(\\mathbf{d})" displayMode />
              </div>
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSDerivation')}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{t('threeGSDerivationText')}</p>
              </div>
            </div>
          </Section>

          {/* API Endpoints */}
          <Section title={t('apiEndpointsTitle')} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3Endpoint')}</h4>
                <pre className="bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                  {t('sr3EndpointCode')}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSEndpoint')}</h4>
                <pre className="bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap">
                  {t('threeGSEndpointCode')}
                </pre>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
