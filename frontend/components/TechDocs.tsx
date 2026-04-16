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
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function TechDocs() {
  const { t, locale } = useI18n();
  const isZh = locale === 'zh';

  return (
    <div className="glass rounded-lg glow-blue animate-fade-in">
      <div className="p-5">
        <h3 className="text-lg font-bold text-zinc-100 mb-4">{t('techDocsTitle')}</h3>

        <div className="space-y-3">
          {/* SR3 Diffusion Model */}
          <Section title={t('sr3DiffusionTitle')} defaultOpen={false}>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3ForwardProcess')}</h4>
              <KaTeXFormula formula="q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1 - \bar{\alpha}_t)\mathbf{I})" displayMode />
              <p className="text-xs text-zinc-500 mt-2">{isZh ? '闭式采样：直接从 x₀ 到 xₜ，无需逐步计算' : 'Closed-form: directly from x₀ to xₜ, no step-by-step needed'}</p>
            </div>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3ReverseProcess')}</h4>
              <KaTeXFormula formula="p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t))" displayMode />
              <p className="text-xs text-zinc-500 mt-2">{isZh ? '逆向去噪：UNet 学习从噪声恢复到清晰图像' : 'Reverse denoising: UNet learns to restore from noise to clear image'}</p>
            </div>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('sr3Derivation')}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3DerivationText')}</p>
            </div>
          </Section>

          {/* 3DGS */}
          <Section title={t('threeGSTitle')} defaultOpen={false}>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSRendering')}</h4>
              <KaTeXFormula formula="C(\mathbf{p}) = \sum_{i \in N} c_i \, \alpha_i \prod_{j=1}^{i-1} (1 - \alpha_j)" displayMode />
              <p className="text-xs text-zinc-500 mt-2">{isZh ? 'Alpha 混合：从前往后合成每个高斯的贡献' : 'Alpha blending: front-to-back compositing of each Gaussian'}</p>
            </div>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSSphericalHarmonics')}</h4>
              <KaTeXFormula formula="\text{Color}(\mathbf{d}) = \sum_{l=0}^{L} \sum_{m=-l}^{l} c_{lm} \, Y_{lm}(\mathbf{d})" displayMode />
              <p className="text-xs text-zinc-500 mt-2">{isZh ? '球谐函数：用基函数展开表示视角相关颜色' : 'Spherical harmonics: basis function expansion for view-dependent color'}</p>
            </div>
            <div>
              <h4 className="text-sm font-mono text-zinc-400 mb-2">{t('threeGSDerivation')}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{t('threeGSDerivationText')}</p>
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
