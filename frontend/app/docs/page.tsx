'use client';

import { motion } from 'framer-motion';
import { KaTeXFormula } from '@/components/KaTeXFormula';
import { useI18n } from '@/lib/i18n';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

function Callout({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 my-6">
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
      <div className="flex justify-between items-baseline mb-2">
        <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{label}</p>
      </div>
      <div className="rounded-lg bg-[#0a0a0a] border border-zinc-800/40 px-6 py-5 overflow-x-auto shadow-inner">
        <KaTeXFormula formula={formula} displayMode />
      </div>
      {description && <p className="text-xs text-zinc-500 mt-2 italic">{description}</p>}
    </div>
  );
}

// 纯 CSS 绘制的高级论文架构图
function DiffusionDiagram() {
  return (
    <div className="my-8 p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/10 flex flex-col items-center justify-center gap-4 overflow-hidden">
      <p className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-widest">Markov Chain Process</p>
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-zinc-300">y (LR)</div>
          <span>Condition</span>
        </div>
        <div className="text-zinc-600">➕</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded border border-zinc-600 bg-zinc-200 text-zinc-900 flex items-center justify-center font-bold">x₀</div>
          <span>HR Image</span>
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
        Reverse Process: p_θ(x_{t-1} | x_t, y) via UNet
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent my-10" />;
}

export default function DocsPage() {
  const { t, locale } = useI18n();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="mx-auto w-full max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8 font-sans"
    >
      <motion.div variants={sectionVariants} className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-4">
          Core Algorithms & Derivations
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          Detailed mathematical foundations and implementation heuristics for Conditional Diffusion Models (SR3) and 3D Gaussian Splatting.
        </p>
      </motion.div>

      {/* SR3 Section */}
      <motion.section id="sr3" variants={sectionVariants} className="mb-20">
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2 border-l-2 border-blue-500 pl-3">
            1. SR3: Conditional Diffusion for Super-Resolution
          </h2>
          <p className="text-sm text-zinc-400 pl-3.5">
            Formulating image enhancement as a stochastic differential equation and reversing it via a parameterized Markov chain.
          </p>
        </div>

        <DiffusionDiagram />

        <div className="prose prose-invert prose-zinc max-w-none space-y-6">
          <h3 className="text-base font-medium text-zinc-200">1.1 The Forward Process (Data to Noise)</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The forward process $q$ is a fixed Markov chain that gradually adds Gaussian noise to the high-resolution image $x_0$ according to a variance schedule $\beta_1, \dots, \beta_T$. The transition kernel is defined as:
          </p>

          <FormulaBlock
            label="Markov Transition Kernel"
            formula="q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t} x_{t-1}, \beta_t \mathbf{I})"
          />

          <p className="text-sm text-zinc-400 leading-relaxed">
            A crucial property of this process is that we can sample $x_t$ at any arbitrary timestep $t$ directly from $x_0$ using the reparameterization trick. Let $\alpha_t = 1 - \beta_t$ and $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$:
          </p>

          <FormulaBlock
            label="Direct Sampling (Closed-form)"
            formula="q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1 - \bar{\alpha}_t)\mathbf{I})"
            description="This allows for highly efficient training without unrolling the entire chain."
          />

          <Divider />

          <h3 className="text-base font-medium text-zinc-200">1.2 The Reverse Process (Noise to Data)</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The true reverse transitions $q(x_{t-1} | x_t)$ are intractable. However, when conditioned on $x_0$, the posterior becomes tractable. SR3 injects the low-resolution image $y$ as a condition to approximate the reverse process using a neural network $p_\theta$:
          </p>

          <FormulaBlock
            label="Conditional Reverse Transition"
            formula="p_\theta(x_{t-1} | x_t, y) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, y, t), \sigma_t^2 \mathbf{I})"
          />

          <p className="text-sm text-zinc-400 leading-relaxed">
            To train the UNet $\epsilon_\theta$, we minimize the Kullback-Leibler (KL) divergence between the true posterior and the parameterized transition. This derives the Variational Lower Bound (VLB). Through rigorous simplification, the objective reduces to matching the noise:
          </p>

          <FormulaBlock
            label="Simplified VLB Objective (Noise Prediction)"
            formula="\mathcal{L}_{\text{simple}} = \mathbb{E}_{x_0, y, \epsilon \sim \mathcal{N}(0,\mathbf{I}), t} \left[ \|\epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t}x_0 + \sqrt{1-\bar{\alpha}_t}\epsilon, y, t)\|_2^2 \right]"
          />

          <Callout label="Algorithm Engineer's Insight">
            In SR3, unlike standard unconditional generation, the low-resolution condition $y$ is concatenated channel-wise with $x_t$ before being fed into the UNet. We observed that employing a noise conditioning augmentation (adding slight noise to $y$ during training) significantly reduces artifacts and domain shift during inference.
          </Callout>
        </div>
      </motion.section>

      {/* 3DGS Section continues similarly... */}
    </motion.div>
  );
}