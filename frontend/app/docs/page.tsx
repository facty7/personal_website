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
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 my-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

function FormulaBlock({ formula, label }: { formula: string; label: string }) {
  return (
    <div className="py-3">
      <p className="text-[11px] font-mono text-zinc-500 mb-2 uppercase tracking-wider">{label}</p>
      <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/40 px-6 py-4 overflow-x-auto">
        <KaTeXFormula formula={formula} displayMode />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-zinc-800/60 my-8" />;
}

export default function DocsPage() {
  const { t, locale } = useI18n();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={sectionVariants} className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {t('docsTitle')}
          </h1>
        </div>
        <p className="text-sm text-zinc-500 max-w-2xl">
          {t('docsSubtitle')}
        </p>
      </motion.div>

      {/* TOC */}
      <motion.div variants={sectionVariants} className="mb-10">
        <nav className="flex flex-wrap gap-2">
          {[
            { id: 'sr3', label: locale === 'en' ? 'SR3 Diffusion' : 'SR3 扩散模型' },
            { id: 'gs', label: '3DGS' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-zinc-800 bg-zinc-900/30 px-4 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </motion.div>

      {/* SR3 Section */}
      <motion.section id="sr3" variants={sectionVariants} className="mb-16">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">
            SR3: Image Super-Resolution via Iterative Refinement
          </h2>
          <p className="text-sm text-zinc-500">
            {locale === 'en'
              ? 'Conditional Markov Chain for image super-resolution through reverse diffusion'
              : '基于条件马尔可夫链的图像超分辨率逆向扩散方法'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6 sm:p-8 space-y-2">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            {locale === 'en' ? '1.1 Forward Diffusion Process' : '1.1 前向加噪过程'}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'We gradually inject Gaussian noise into the high-resolution data distribution x₀ ~ q(x) over T steps. Given timestep t and noise variance schedule β₁, ..., βₜ, the single-step transition probability is:'
              : '我们在高分辨率数据分布 x₀ ~ q(x) 上，通过 T 步逐步注入高斯噪声。设时间步为 t，噪声方差表为 β₁, ..., βₜ，则单步转移概率为：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Single-step transition' : '单步转移概率'}
            formula="q(x_t | x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1 - \\beta_t}\\, x_{t-1}, \\beta_t \\mathbf{I})"
          />

          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'Using the reparameterization trick, we obtain the closed-form solution for directly sampling xₜ from x₀ (where αₜ = 1 - βₜ, ᾱₜ = ∏ᵢ₌₁ᵗ αᵢ):'
              : '运用重参数化技巧，可以得到从 x₀ 直接采样 xₜ 的闭式解（其中 αₜ = 1 - βₜ，ᾱₜ = ∏ᵢ₌₁ᵗ αᵢ）：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Closed-form sampling' : '闭式解采样'}
            formula="q(x_t | x_0) = \\mathcal{N}(x_t; \\sqrt{\\bar{\\alpha}_t}\\, x_0, (1 - \\bar{\\alpha}_t)\\mathbf{I})"
          />

          <Divider />

          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            {locale === 'en' ? '1.2 Conditional Reverse Process' : '1.2 条件逆向生成过程'}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'The inference stage begins from pure noise x_T ~ N(0, I) and performs reverse denoising. To achieve super-resolution, we upsample the low-resolution image y to the target resolution and use it as a condition input to the denoising network:'
              : '推断阶段是从纯噪声 x_T ~ N(0, I) 开始的逆向去噪。为了实现超分辨率，我们将低分辨率图像 y 上采样至目标分辨率，并作为条件输入到去噪网络中：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Reverse denoising' : '逆向去噪过程'}
            formula="p_\\theta(x_{t-1} | x_t, y) = \\mathcal{N}(x_{t-1}; \\mu_\\theta(x_t, y, t), \\sigma_t^2 \\mathbf{I})"
          />

          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'To train the denoising network ε_θ, we optimize the simplified variational lower bound — predicting the injected noise:'
              : '为了训练去噪网络 ε_θ，我们优化简化的变分下界，即预测注入的噪声：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Loss function' : '损失函数'}
            formula="\\mathcal{L}_{\\text{simple}} = \\mathbb{E}_{x_0, y, \\epsilon \\sim \\mathcal{N}(0,\\mathbf{I}), t} \\left[ \\|\\epsilon - \\epsilon_\\theta(x_t, y, t)\\|_2^2 \\right]"
          />

          <Callout label={locale === 'en' ? 'Engineering Insight' : '工程心得'}>
            {locale === 'en'
              ? 'In practice, the long inference time is a common issue with diffusion models. Adopting the DDIM sampling strategy instead of DDPM can compress the sampling steps from 1000 to under 100 with almost no degradation in visual quality.'
              : '在实际部署中，推理时间较长是扩散模型的通病。采用 DDIM 采样策略替代 DDPM，能够在视觉质量几乎不降级的前提下，将采样步数从 1000 步压缩至 100 步以内。'}
          </Callout>
        </div>
      </motion.section>

      {/* 3DGS Section */}
      <motion.section id="gs" variants={sectionVariants} className="mb-16">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">
            3D Gaussian Splatting (3DGS) Scene Representation
          </h2>
          <p className="text-sm text-zinc-500">
            {locale === 'en'
              ? 'Explicit anisotropic 3D Gaussian representation with tile-based rasterization for real-time rendering'
              : '各向异性 3D 高斯体显式表征与 Tile-based 光栅化实时渲染'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6 sm:p-8 space-y-2">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            {locale === 'en' ? '2.1 Anisotropic 3D Gaussian' : '2.1 各向异性 3D 高斯函数'}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'Traditional NeRF relies on implicit neural networks for volume rendering, which is computationally expensive. 3DGS innovatively uses anisotropic 3D Gaussians for explicit representation. For any point x, the probability density of a Gaussian body is defined as:'
              : '传统 NeRF 依赖隐式神经网络进行体渲染，计算代价昂贵。3DGS 则创新性地采用各向异性 3D 高斯体进行显式表征。对于任意点 x，高斯体的概率密度定义为：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Gaussian density' : '高斯概率密度'}
            formula="G(x) = \\exp\\!\\left(-\\tfrac{1}{2}(x - \\mu)^{\\top} \\Sigma^{-1} (x - \\mu)\\right)"
          />

          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'To ensure Σ remains positive semi-definite during gradient descent optimization, 3DGS decomposes the covariance matrix into a scaling matrix S and a rotation matrix R (represented as a quaternion):'
              : '为了保证 Σ 在梯度下降优化过程中始终为半正定矩阵，3DGS 将协方差矩阵分解为缩放矩阵 S 和旋转矩阵 R（用四元数表示）：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Covariance decomposition' : '协方差矩阵分解'}
            formula="\\Sigma = R S S^{\\top} R^{\\top}"
          />

          <Divider />

          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            {locale === 'en' ? '2.2 Alpha Blending (Rendering Equation)' : '2.2 Alpha Blending（渲染方程）'}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'When rendering from a given camera pose, 3D Gaussians are projected onto the 2D image plane, forming 2D covariance matrices Σ\'. The color C along a ray is computed via front-to-back alpha blending:'
              : '在给定相机位姿进行渲染时，3D 高斯体会被投影到 2D 图像平面，形成 2D 协方差矩阵 Σ\'。沿着射线的颜色 C 通过从前到后的 alpha 混合计算得到：'}
          </p>

          <FormulaBlock
            label={locale === 'en' ? 'Alpha blending' : 'Alpha 混合公式'}
            formula="C = \\sum_{i \\in \\mathcal{N}} c_i \\, \\alpha_i \\prod_{j=1}^{i-1} (1 - \\alpha_j)"
          />

          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            {locale === 'en'
              ? 'Here c_i is the view-dependent color computed via Spherical Harmonics (SH), and α_i is the weight obtained by multiplying the 2D Gaussian probability density with the opacity parameter.'
              : '其中 c_i 是通过球谐函数 (Spherical Harmonics, SH) 计算出的视角相关颜色，α_i 是由 2D 高斯概率密度和不透明度参数相乘得到的权重。'}
          </p>

          <Callout label={locale === 'en' ? 'Engineering Insight' : '工程心得'}>
            {locale === 'en'
              ? '3DGS consumes significant VRAM during training. When building this platform, I optimized the C++ CUDA operator and frontend WebGL memory communication pipeline to ensure fast .ply point cloud parsing in the browser, achieving extremely high frame rate experience.'
              : '3DGS 在训练阶段极度消耗显存。在构建此展示平台时，我优化了 C++ CUDA 算子与前端 WebGL 的显存通信链路，确保 .ply 点云文件在浏览器端的解析速度，实现了极高的帧率体验。'}
          </Callout>
        </div>
      </motion.section>
    </motion.div>
  );
}
