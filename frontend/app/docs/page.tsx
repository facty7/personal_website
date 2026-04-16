'use client';

import { useState } from 'react';
import { KaTeXFormula } from '@/components/KaTeXFormula';
import { useI18n } from '@/lib/i18n';

/* ── reusable sub-components ── */

function Callout({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-amber-800/40 bg-amber-900/10 p-4 my-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

function FormulaBlock({ formula, label, description }: { formula: string; label: string; description?: string }) {
  return (
    <div className="py-4">
      <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="rounded-lg bg-[#0a0a0a] border border-zinc-800/40 px-6 py-5 overflow-x-auto shadow-inner">
        <KaTeXFormula formula={formula} displayMode />
      </div>
      {description && <p className="text-xs text-zinc-500 mt-2 italic">{description}</p>}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent my-10" />;
}

/* ── SR3 Diagrams ── */

function SR3DiffusionDiagram({ t }: { t: (k: string) => string }) {
  const isZh = t('navDocs') === '算法原理';
  return (
    <div className="my-8 p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col items-center justify-center gap-4 overflow-hidden">
      <p className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-widest">{isZh ? '马尔可夫链过程' : 'Markov Chain Process'}</p>
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-zinc-300 text-center leading-tight p-1">{isZh ? 'y (低清)' : 'y (LR)'}</div>
          <span>{isZh ? '条件' : 'Condition'}</span>
        </div>
        <div className="text-zinc-600">➕</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded border border-zinc-600 bg-zinc-200 text-zinc-900 flex items-center justify-center font-bold">x₀</div>
          <span>{isZh ? '高清图像' : 'HR Image'}</span>
        </div>
        <div className="flex flex-col items-center opacity-70">
          <span>→</span>
          <span className="text-[10px]">q(x₁|x₀)</span>
        </div>
        <div className="w-16 h-16 rounded border border-dashed border-zinc-600 bg-zinc-800/30 flex items-center justify-center text-zinc-500">x₁</div>
        <div className="flex flex-col items-center opacity-50">
          <span>→ ... →</span>
        </div>
        <div className="w-16 h-16 rounded border border-dotted border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-600">x_T</div>
      </div>
      <div className="mt-2 text-[10px] text-emerald-500/70 bg-emerald-500/10 px-3 py-1 rounded-full">
        {isZh ? '逆向过程: p_θ(x_{t-1} | x_t, y) 通过 UNet' : 'Reverse Process: p_θ(x_{t-1} | x_t, y) via UNet'}
      </div>
    </div>
  );
}

function SNRDiagram({ t }: { t: (k: string) => string }) {
  const isZh = t('navDocs') === '算法原理';
  return (
    <div className="my-4 p-4 rounded-lg border border-zinc-800/30 bg-zinc-900/20 font-mono text-xs">
      <p className="text-zinc-500 mb-3 text-center">{isZh ? '信噪比随时间步变化' : 'SNR vs. Timestep'}</p>
      <div className="flex items-end gap-1 h-24 justify-center">
        {[1.0, 0.85, 0.7, 0.55, 0.4, 0.25, 0.15, 0.08, 0.03, 0.01].map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-6 rounded-t bg-gradient-to-t from-blue-600 to-blue-400"
              style={{ height: `${v * 80}px` }}
            />
            <span className="text-[9px] text-zinc-600">{i === 0 ? '0' : i === 9 ? 'T' : ''}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-zinc-600">
        <span>t=0 ({isZh ? '纯信号' : 'pure signal'})</span>
        <span>t=T ({isZh ? '纯噪声' : 'pure noise'})</span>
      </div>
    </div>
  );
}

function CovarianceVisual({ t }: { t: (k: string) => string }) {
  const isZh = t('navDocs') === '算法原理';
  return (
    <div className="my-4 p-4 rounded-lg border border-zinc-800/30 bg-zinc-900/20 font-mono text-xs">
      <p className="text-zinc-500 mb-3 text-center">{isZh ? '协方差矩阵形状对比' : 'Covariance Matrix Shapes'}</p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-400 bg-blue-400/10" />
          <p className="text-zinc-500 mt-1">{isZh ? '各向同性' : 'Isotropic'}</p>
          <p className="text-zinc-600 text-[10px]">σ₁²=σ₂²=σ₃²</p>
        </div>
        <div>
          <div className="w-24 h-12 mx-auto rounded-full border-2 border-purple-400 bg-purple-400/10" />
          <p className="text-zinc-500 mt-1">{isZh ? '各向异性' : 'Anisotropic'}</p>
          <p className="text-zinc-600 text-[10px]">σ₁²&gt;σ₂²=σ₃²</p>
        </div>
        <div>
          <div className="w-20 h-10 mx-auto rounded-full border-2 border-amber-400 bg-amber-400/10 rotate-45" />
          <p className="text-zinc-500 mt-1">{isZh ? '旋转椭球' : 'Rotated'}</p>
          <p className="text-zinc-600 text-[10px]">σ₁₂ ≠ 0</p>
        </div>
      </div>
    </div>
  );
}

function SHVisual({ t }: { t: (k: string) => string }) {
  const isZh = t('navDocs') === '算法原理';
  return (
    <div className="my-4 p-4 rounded-lg border border-zinc-800/30 bg-zinc-900/20 font-mono text-xs">
      <p className="text-zinc-500 mb-3 text-center">{isZh ? '球谐函数次数可视化' : 'Spherical Harmonics Degrees'}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { l: 'l=0', desc: isZh ? '常数/漫反射' : 'Constant/Diffuse', emoji: '🟢' },
          { l: 'l=1', desc: isZh ? '线性梯度' : 'Linear Gradient', emoji: '🟡' },
          { l: 'l=2', desc: isZh ? '二次/光照变化' : 'Quadratic/Lighting', emoji: '🟠' },
          { l: 'l=3', desc: isZh ? '三次/镜面高光' : 'Cubic/Specular', emoji: '🔴' },
        ].map(item => (
          <div key={item.l} className="p-2 rounded bg-zinc-800/30">
            <div className="text-2xl mb-1">{item.emoji}</div>
            <p className="text-zinc-300 font-bold">{item.l}</p>
            <p className="text-zinc-500 text-[10px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DensificationVisual({ t }: { t: (k: string) => string }) {
  const isZh = t('navDocs') === '算法原理';
  return (
    <div className="my-4 p-4 rounded-lg border border-zinc-800/30 bg-zinc-900/20 font-mono text-xs">
      <p className="text-zinc-500 mb-3 text-center">{isZh ? '自适应密度控制示意' : 'Adaptive Density Control'}</p>
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <p className="text-blue-400 font-bold mb-2">{isZh ? '分裂 (Split)' : 'Split'}</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full border border-blue-400 bg-blue-400/20" />
            <span className="text-zinc-600">→</span>
            <div className="w-6 h-6 rounded-full border border-blue-400 bg-blue-400/20" />
            <div className="w-6 h-6 rounded-full border border-blue-400 bg-blue-400/20" />
          </div>
          <p className="text-zinc-600 text-[10px] mt-1">{isZh ? '大高斯 → 两个小高斯' : 'Large → two small'}</p>
        </div>
        <div className="text-center">
          <p className="text-purple-400 font-bold mb-2">{isZh ? '克隆 (Clone)' : 'Clone'}</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border border-purple-400 bg-purple-400/20" />
            <span className="text-zinc-600">→</span>
            <div className="w-5 h-5 rounded-full border border-purple-400 bg-purple-400/20" />
            <div className="w-5 h-5 rounded-full border border-purple-400 bg-purple-400/20 ml-2" />
          </div>
          <p className="text-zinc-600 text-[10px] mt-1">{isZh ? '小高斯 → 复制填补' : 'Small → duplicate'}</p>
        </div>
      </div>
    </div>
  );
}

/* ── SR3 Content ── */

function SR3Content() {
  const { t } = useI18n();

  return (
    <div className="prose prose-invert prose-zinc max-w-none">
      {/* Overview */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-blue-500 pl-3">
          {t('sr3Overview')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('sr3OverviewText')}
        </p>
      </div>

      {/* Section 1: Forward Process */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-blue-500 pl-3">
          {t('sr3Section1')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('sr3Section1Intro')}
        </p>
      </div>

      {/* 1.1 Gaussian 1D */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec1Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec1Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_gaussian1d')}
          formula="p(x) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\!\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)"
          description={t('sr3Subsec1Note')}
        />
      </div>

      <Divider />

      {/* 1.2 Multivariate Gaussian */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec2Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec2Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_gaussianNd_label')}
          formula="p(\mathbf{x}) = \frac{1}{\sqrt{(2\pi)^d |\boldsymbol{\Sigma}|}} \exp\!\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^{\top} \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)"
          description={t('sr3Formula_gaussianNd_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec2Note')}</p>
      </div>

      <Divider />

      {/* 1.3 Markov Chain */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec3Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec3Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_forward_label')}
          formula="q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t}\, x_{t-1}, \beta_t \mathbf{I})"
          description={t('sr3Formula_forward_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec3Note')}</p>
        <div className="rounded-lg bg-[#0a0a0a] border border-zinc-800/40 px-6 py-3 overflow-x-auto mt-3">
          <KaTeXFormula formula="x_t = \sqrt{1 - \beta_t}\, x_{t-1} + \sqrt{\beta_t}\, \epsilon, \quad \epsilon \sim \mathcal{N}(0, \mathbf{I})" displayMode />
        </div>
      </div>

      <SR3DiffusionDiagram t={t} />

      <Divider />

      {/* 1.4 Closed-form */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec4Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec4Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_closedform_label')}
          formula="q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t}\, x_0, (1 - \bar{\alpha}_t)\mathbf{I})"
          description={t('sr3Formula_closedform_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec4Note')}</p>
      </div>

      <Divider />

      {/* 1.4.1 Variance Schedule */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec5Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec5Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_variance_label')}
          formula="\beta_t = \beta_1 + \frac{t - 1}{T - 1}(\beta_T - \beta_1)"
          description={t('sr3Formula_variance_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec5Note')}</p>
      </div>

      <Divider />

      {/* 1.4.2 SNR */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec6Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec6Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_snr_label')}
          formula="\text{SNR}(t) = \frac{\bar{\alpha}_t}{1 - \bar{\alpha}_t}"
          description={t('sr3Formula_snr_desc')}
        />
        <SNRDiagram t={t} />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec6Note')}</p>
      </div>

      <Divider />

      {/* Section 2: Reverse Process */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-emerald-500 pl-3">
          {t('sr3Section2Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('sr3Section2Intro')}
        </p>
      </div>

      {/* 2.1 True Posterior */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec7Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec7Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_bayes_label')}
          formula="q(x_{t-1} | x_t) = \frac{q(x_t | x_{t-1}) \, q(x_{t-1})}{q(x_t)}"
          description={t('sr3Formula_bayes_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec7Note')}</p>
      </div>

      <Divider />

      {/* 2.2 Conditional Posterior */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec8Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec8Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_conditional_label')}
          formula="q(x_{t-1} | x_t, x_0) = \mathcal{N}\!\left(x_{t-1}; \, \frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t}x_t + \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1 - \bar{\alpha}_t}x_0, \, \frac{\bar{\alpha}_{t-1}\beta_t}{1 - \bar{\alpha}_t}\mathbf{I}\right)"
          description={t('sr3Formula_conditional_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec8Note')}</p>
      </div>

      <Divider />

      {/* 2.3 Parameterized Reverse */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec9Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec9Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_reverse_label')}
          formula="p_\theta(x_{t-1} | x_t, y) = \mathcal{N}(x_{t-1}; \, \mu_\theta(x_t, y, t), \, \sigma_t^2 \mathbf{I})"
          description={t('sr3Formula_reverse_desc')}
        />
        <div className="mt-4 rounded-lg bg-[#0a0a0a] border border-zinc-800/40 px-6 py-4 overflow-x-auto">
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">{t('navDocs') === '算法原理' ? '均值计算公式' : 'Mean Computation'}</p>
          <KaTeXFormula formula="\mu_\theta(x_t, y, t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}}\epsilon_\theta(x_t, y, t)\right)" displayMode />
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec9Note')}</p>
      </div>

      <Divider />

      {/* 2.4 Conditioning */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec10Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec10Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_condition_label')}
          formula="\text{UNet input: } [\, x_t \, \| \, \text{Upsample}(y) \,] \in \mathbb{R}^{2C \times H \times W}"
          description={t('sr3Formula_condition_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec10Note')}</p>
      </div>

      <Divider />

      {/* Section 3: Training */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-amber-500 pl-3">
          {t('sr3Section3Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('sr3Section3Intro')}
        </p>
      </div>

      {/* 3.1 ELBO */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec11Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec11Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_elbo_label')}
          formula="\log p_\theta(x_0) \geq \mathbb{E}_q\!\left[\log \frac{p_\theta(x_{0:T})}{q(x_{1:T} | x_0)}\right] = \text{ELBO}"
          description={t('sr3Formula_elbo_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec11Note')}</p>
      </div>

      <Divider />

      {/* 3.2 Simplified Objective */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec12Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec12Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_simple_label')}
          formula="\mathcal{L}_{\text{simple}} = \mathbb{E}_{x_0, y, \epsilon, t} \left[ \|\epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t}\,x_0 + \sqrt{1-\bar{\alpha}_t}\,\epsilon, \, y, \, t)\|_2^2 \right]"
          description={t('sr3Formula_simple_desc')}
        />
        <Callout label={t('navDocs') === '算法原理' ? '训练流程' : 'Training Pipeline'}>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t('navDocs') === '算法原理' ? '采样真实 HR 图像 x₀' : 'Sample real HR image x₀'}</li>
            <li>{t('navDocs') === '算法原理' ? '采样随机噪声 ε ~ N(0, I)' : 'Sample random noise ε ~ N(0, I)'}</li>
            <li>{t('navDocs') === '算法原理' ? '采样随机时间步 t ~ Uniform({1, ..., T})' : 'Sample random timestep t ~ Uniform({1, ..., T})'}</li>
            <li>{t('navDocs') === '算法原理' ? '计算噪声图像 xₜ = √ᾱₜ·x₀ + √(1−ᾱₜ)·ε' : 'Compute noisy image xₜ = √ᾱₜ·x₀ + √(1−ᾱₜ)·ε'}</li>
            <li>{t('navDocs') === '算法原理' ? '通过梯度下降最小化 ||ε - ε_θ(xₜ, y, t)||²' : 'Minimize ||ε - ε_θ(xₜ, y, t)||² via gradient descent'}</li>
          </ol>
        </Callout>
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec12Note')}</p>
      </div>

      <Divider />

      {/* 3.3 Swin2SR note */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec13Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec13Text')}</p>
        <Callout label={t('navDocs') === '算法原理' ? '工程注意' : 'Engineering Note'}>
          <p>{t('sr3Subsec13Note')}</p>
        </Callout>
        <FormulaBlock
          label={t('sr3Formula_swin2sr_label')}
          formula="\hat{x}_{HR} = \text{Swin2SR}(x_{LR}), \quad \text{scale factor} = 2\times"
          description={t('sr3Formula_swin2sr_desc')}
        />
      </div>

      <Divider />

      {/* Section 4: Inference */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-purple-500 pl-3">
          {t('sr3Section4Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('sr3Section4Intro')}
        </p>
      </div>

      {/* 4.1 Sampling */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec14Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec14Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_sample_label')}
          formula="x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\!\left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\epsilon_\theta(x_t, y, t)\right) + \sigma_t z, \quad z \sim \mathcal{N}(0, \mathbf{I})"
          description={t('sr3Formula_sample_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec14Note')}</p>
      </div>

      <Divider />

      {/* 4.2 CFG */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('sr3Subsec15Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('sr3Subsec15Text')}</p>
        <FormulaBlock
          label={t('sr3Formula_cfg_label')}
          formula="\hat{\epsilon}_\theta = \omega \cdot \epsilon_\theta(x_t, y, t) + (1 - \omega) \cdot \epsilon_\theta(x_t, \emptyset, t)"
          description={t('sr3Formula_cfg_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('sr3Subsec15Note')}</p>
      </div>
    </div>
  );
}

/* ── 3DGS Content ── */

function GSContent() {
  const { t } = useI18n();

  return (
    <div className="prose prose-invert prose-zinc max-w-none">
      {/* Overview */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-purple-500 pl-3">
          {t('gsOverview')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsOverviewText')}
        </p>
      </div>

      {/* Section 1: 3D Gaussian */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-blue-500 pl-3">
          {t('gsSection1Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsSection1Intro')}
        </p>
      </div>

      {/* 1.1 1D to 3D */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec1Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec1Text')}</p>
        <FormulaBlock
          label={t('gsFormula_gaussian3d_label')}
          formula="G(\mathbf{x}) = \exp\!\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^{\top} \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)"
          description={t('gsFormula_gaussian3d_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec1Note')}</p>
      </div>

      <Divider />

      {/* 1.2 Covariance */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec2Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec2Text')}</p>
        <FormulaBlock
          label={t('gsFormula_cov_diag_label')}
          formula="\boldsymbol{\Sigma} = \begin{pmatrix} \sigma_1^2 & 0 & 0 \\ 0 & \sigma_2^2 & 0 \\ 0 & 0 & \sigma_3^2 \end{pmatrix}"
          description={t('gsFormula_cov_diag_desc')}
        />
        <CovarianceVisual t={t} />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec2Note')}</p>
      </div>

      <Divider />

      {/* 1.3 Covariance Decomposition */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec3Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec3Text')}</p>
        <FormulaBlock
          label={t('gsFormula_cov_decomp_label')}
          formula="\boldsymbol{\Sigma} = \mathbf{R} \mathbf{S} \mathbf{S}^{\top} \mathbf{R}^{\top}"
          description={t('gsFormula_cov_decomp_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec3Note')}</p>
      </div>

      <Divider />

      {/* 1.4 Quaternion */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec4Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec4Text')}</p>
        <FormulaBlock
          label={t('gsFormula_quaternion_label')}
          formula="\mathbf{q} = w + x\mathbf{i} + y\mathbf{j} + z\mathbf{k}, \quad \|\mathbf{q}\| = \sqrt{w^2 + x^2 + y^2 + z^2} = 1"
          description={t('gsFormula_quaternion_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec4Note')}</p>
      </div>

      <Divider />

      {/* Section 2: 3D to 2D Projection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-emerald-500 pl-3">
          {t('gsSection2Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsSection2Intro')}
        </p>
      </div>

      {/* 2.1 EWA */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec5Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec5Text')}</p>
        <FormulaBlock
          label={t('gsFormula_ewa_label')}
          formula="\boldsymbol{\Sigma}' = \mathbf{J} \mathbf{W} \boldsymbol{\Sigma} \mathbf{W}^{\top} \mathbf{J}^{\top}"
          description={t('gsFormula_ewa_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec5Note')}</p>
      </div>

      <Divider />

      {/* 2.2 Pinhole Camera */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec6Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec6Text')}</p>
        <FormulaBlock
          label={t('gsFormula_pinhole_label')}
          formula="u = f_x \cdot \frac{X}{Z} + c_x, \quad v = f_y \cdot \frac{Y}{Z} + c_y"
          description={t('gsFormula_pinhole_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec6Note')}</p>
      </div>

      <Divider />

      {/* 2.3 2D Splat */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec7Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec7Text')}</p>
        <FormulaBlock
          label={t('gsFormula_splat2d_label')}
          formula="\alpha(\mathbf{p}) = \sigma \cdot \exp\!\left(-\frac{1}{2}(\mathbf{p} - \boldsymbol{\mu}')^{\top} {\boldsymbol{\Sigma}'}^{-1} (\mathbf{p} - \boldsymbol{\mu}')\right)"
          description={t('gsFormula_splat2d_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec7Note')}</p>
      </div>

      <Divider />

      {/* Section 3: Alpha Blending */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-amber-500 pl-3">
          {t('gsSection3Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsSection3Intro')}
        </p>
      </div>

      {/* 3.1 Over Operator */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec8Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec8Text')}</p>
        <FormulaBlock
          label={t('gsFormula_over_label')}
          formula="C = C_f \cdot \alpha_f + C_b \cdot (1 - \alpha_f)"
          description={t('gsFormula_over_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec8Note')}</p>
      </div>

      <Divider />

      {/* 3.2 Alpha Compositing */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec9Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec9Text')}</p>
        <FormulaBlock
          label={t('gsFormula_alpha_label')}
          formula="C(\mathbf{p}) = \sum_{i \in \mathcal{N}} c_i \, \alpha_i \prod_{j=1}^{i-1} (1 - \alpha_j)"
          description={t('gsFormula_alpha_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec9Note')}</p>
      </div>

      <Divider />

      {/* 3.3 Volume Rendering */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec10Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec10Text')}</p>
        <FormulaBlock
          label={t('gsFormula_volumerender_label')}
          formula="C(\mathbf{r}) = \int_{t_n}^{t_f} T(t) \, \sigma(\mathbf{r}(t)) \, c(\mathbf{r}(t), \mathbf{d}) \, dt, \quad T(t) = \exp\!\left(-\int_{t_n}^{t} \sigma(\mathbf{r}(s)) \, ds\right)"
          description={t('gsFormula_volumerender_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec10Note')}</p>
      </div>

      <Divider />

      {/* Section 4: Spherical Harmonics */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-rose-500 pl-3">
          {t('gsSection4Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsSection4Intro')}
        </p>
      </div>

      {/* 4.1 What are SH */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec11Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec11Text')}</p>
        <FormulaBlock
          label={t('gsFormula_sh_label')}
          formula="Y_l^m(\theta, \phi) = \sqrt{\frac{(2l+1)(l-m)!}{4\pi(l+m)!}} \, P_l^m(\cos\theta) \, e^{im\phi}"
          description={t('gsFormula_sh_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec11Note')}</p>
      </div>

      <Divider />

      {/* 4.2 SH Color */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec12Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec12Text')}</p>
        <FormulaBlock
          label={t('gsFormula_shcolor_label')}
          formula="\text{Color}(\mathbf{d}) = \sum_{l=0}^{L} \sum_{m=-l}^{l} c_{lm} \, Y_l^m(\mathbf{d})"
          description={t('gsFormula_shcolor_desc')}
        />
        <SHVisual t={t} />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec12Note')}</p>
      </div>

      <Divider />

      {/* 4.3 Low-degree SH */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec13Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec13Text')}</p>
        <FormulaBlock
          label={t('gsFormula_shvis_label')}
          formula="Y_0^0 = \frac{1}{2\sqrt{\pi}}, \quad Y_1^0 = \sqrt{\frac{3}{4\pi}}\cos\theta, \quad Y_2^0 = \sqrt{\frac{5}{16\pi}}(3\cos^2\theta - 1)"
          description={t('gsFormula_shvis_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec13Note')}</p>
      </div>

      <Divider />

      {/* Section 5: Adaptive Density */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-cyan-500 pl-3">
          {t('gsSection5Title')}
        </h2>
        <p className="text-sm text-zinc-400 pl-3.5 leading-relaxed">
          {t('gsSection5Intro')}
        </p>
      </div>

      {/* 5.1 Why Adaptive */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec14Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec14Text')}</p>
      </div>

      <Divider />

      {/* 5.2 Densification */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec15Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec15Text')}</p>
        <FormulaBlock
          label={t('gsFormula_split_label')}
          formula="\text{Split: } \mathbf{s}' = \frac{\mathbf{s}}{1.6}, \quad \text{Clone: } \boldsymbol{\mu}' = \boldsymbol{\mu} + \mathcal{N}(0, \epsilon \mathbf{I})"
          description={t('gsFormula_split_desc')}
        />
        <DensificationVisual t={t} />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec15Note')}</p>
      </div>

      <Divider />

      {/* 5.3 Pruning */}
      <div className="mb-10">
        <h3 className="text-base font-medium text-zinc-200 mb-3">{t('gsSubsec16Title')}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{t('gsSubsec16Text')}</p>
        <FormulaBlock
          label={t('gsFormula_prune_label')}
          formula="\text{Remove } G_i \text{ if } \alpha_i < \epsilon_\alpha \approx 0.005 \text{ or } \|\mathbf{s}_i\| \text{ too large/small}"
          description={t('gsFormula_prune_desc')}
        />
        <p className="text-sm text-zinc-400 leading-relaxed mt-3">{t('gsSubsec16Note')}</p>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function DocsPage() {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'sr3' | 'gs'>('sr3');

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-4">
          {t('docsTitle')}
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          {t('docsSubtitle')}
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-3 mb-12 justify-center">
        <button
          onClick={() => setActiveTab('sr3')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border ${
            activeTab === 'sr3'
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
              : 'bg-zinc-900/50 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
          }`}
        >
          {t('tabSR3')}
        </button>
        <button
          onClick={() => setActiveTab('gs')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border ${
            activeTab === 'gs'
              ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.15)]'
              : 'bg-zinc-900/50 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
          }`}
        >
          {t('tab3DGS')}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sr3' ? <SR3Content /> : <GSContent />}
    </div>
  );
}
