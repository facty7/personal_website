'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'zh' | 'en';

const translations: Record<Locale, Record<string, string | ((...args: unknown[]) => string)>> = {
  en: {
    // Layout
    siteTitle: 'SR3 & 3DGS Processing Platform',
    siteSubtitle: 'Vercel Frontend + Hugging Face Spaces Backend',

    // Hero
    heroTitle: 'Super-Resolution & 3D Reconstruction',
    heroDescription: 'Upload images for AI-powered enhancement and 3D Gaussian Splatting.',

    // SR3
    sr3Title: 'SR3 Super-Resolution',
    sr3Desc: 'Enhance image resolution with deep learning',
    uploadImage: 'Upload Image',
    uploadImageHint: 'Click to upload image',
    uploadImageFormats: 'PNG, JPG, WEBP up to 10MB',
    enhanceWithSR3: 'Enhance with SR3',
    originalImage: 'Original Image',
    enhancedImage: 'Enhanced Image (SR3 Output)',
    srSuperResolutionApplied: 'Super-resolution applied',
    sr3HowItWorksTitle: 'How it works',
    sr3HowItWorks1: 'Upload an image (JPG, PNG, WEBP)',
    sr3HowItWorks2: 'Click "Enhance with SR3" to apply super-resolution',
    sr3HowItWorks3: 'Compare original vs enhanced images side-by-side',
    sr3HowItWorks4: 'The SR3 model increases image resolution while preserving details',

    // 3DGS
    gsTitle: '3DGS Reconstruction',
    gsDesc: 'Generate 3D models from multi-view images',
    selectImages: 'Select Images (Multiple)',
    selectedImages: (...args: unknown[]) => `Selected ${args[0] as number} image(s)`,
    processWith3DGS: 'Process with 3DGS',
    no3DModel: 'No 3D Model Loaded',
    no3DModelDesc: 'Process images with 3DGS to generate and preview a 3D Gaussian Splatting model.',
    previewWillAppear: 'The preview will appear here once processing is complete.',
    downloadPLY: 'Download .ply',
    hidePreview: 'Hide Preview',
    controls: 'Controls',
    rotate: 'Rotate',
    zoom: 'Zoom',
    pan: 'Pan',
    drag: 'Drag',
    scroll: 'Scroll',
    rightClickDrag: 'Right-click + Drag',
    autoRotationOn: 'Auto-rotation: ON',
    loading3DModel: 'Loading 3D Model',
    fetching: 'Fetching',

    // Common
    processing: 'Processing...',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    reset: 'Reset',
    download: 'Download',
    pleaseUploadImage: 'Please upload an image first',
    pleaseSelectImages: 'Please select at least one image',
    imageTypeError: 'Please upload an image file',
    imageSizeError: 'Image size should be less than 10MB',
    imageEnhanced: 'Image enhanced successfully',

    // Tech Docs
    techDocsTitle: 'Technical Documentation',
    sr3DiffusionTitle: 'SR3 Diffusion Model',
    sr3ForwardProcess: 'Forward Process',
    sr3ReverseProcess: 'Reverse (Denoising) Process',
    sr3Derivation: 'Derivation Notes',
    sr3DerivationText: 'The diffusion process gradually adds Gaussian noise to the image over T timesteps. The reverse process uses a learned neural network to denoise, ultimately recovering a high-resolution image from pure noise.',
    threeGSTitle: '3D Gaussian Splatting',
    threeGSRendering: 'Gaussian Rendering',
    threeGSSphericalHarmonics: 'Spherical Harmonics',
    threeGSDerivation: 'Derivation Notes',
    threeGSDerivationText: '3DGS represents a scene as a collection of 3D Gaussians, each with position, covariance, opacity, and spherical harmonics coefficients for view-dependent color. During rendering, Gaussians are sorted by depth and alpha-composited.',
    apiEndpointsTitle: 'API Endpoints',
    sr3Endpoint: 'SR3 Endpoint',
    sr3EndpointCode: 'POST /api/predict/sr_process\nInput: Single image file via Gradio client\nOutput: Enhanced high-res image URL',
    threeGSEndpoint: '3DGS Endpoint',
    threeGSEndpointCode: 'POST /api/predict/gs_process\nInput: Multiple image files via Gradio client\nOutput: 3D model .ply file URL',

    // API Docs
    apiDocs: 'API Documentation',
    apiDocsFooter: 'See frontend/lib/api.ts for the complete Gradio client implementation.',
    input: 'Input',
    output: 'Output',
  },
  zh: {
    // Layout
    siteTitle: 'SR3 & 3DGS 处理平台',
    siteSubtitle: 'Vercel 前端 + Hugging Face Spaces 后端',

    // Hero
    heroTitle: '超分辨率与三维重建',
    heroDescription: '上传图片进行 AI 增强和 3D 高斯溅射处理。',

    // SR3
    sr3Title: 'SR3 超分辨率',
    sr3Desc: '使用深度学习提升图像分辨率',
    uploadImage: '上传图片',
    uploadImageHint: '点击上传图片',
    uploadImageFormats: 'PNG、JPG、WEBP，最大 10MB',
    enhanceWithSR3: '使用 SR3 增强',
    originalImage: '原始图像',
    enhancedImage: '增强图像（SR3 输出）',
    srSuperResolutionApplied: '已应用超分辨率',
    sr3HowItWorksTitle: '工作原理',
    sr3HowItWorks1: '上传图像（JPG、PNG、WEBP）',
    sr3HowItWorks2: '点击"使用 SR3 增强"应用超分辨率',
    sr3HowItWorks3: '并排对比原始与增强图像',
    sr3HowItWorks4: 'SR3 模型在保留细节的同时提高图像分辨率',

    // 3DGS
    gsTitle: '3DGS 三维重建',
    gsDesc: '从多视角图像生成 3D 模型',
    selectImages: '选择图像（多选）',
    selectedImages: (...args: unknown[]) => `已选择 ${args[0] as number} 张图像`,
    processWith3DGS: '使用 3DGS 处理',
    no3DModel: '未加载 3D 模型',
    no3DModelDesc: '使用 3DGS 处理图像以生成并预览 3D 高斯溅射模型。',
    previewWillAppear: '处理完成后将在此处显示预览。',
    downloadPLY: '下载 .ply 文件',
    hidePreview: '隐藏预览',
    controls: '控制',
    rotate: '旋转',
    zoom: '缩放',
    pan: '平移',
    drag: '拖拽',
    scroll: '滚轮',
    rightClickDrag: '右键 + 拖拽',
    autoRotationOn: '自动旋转：开',
    loading3DModel: '加载 3D 模型',
    fetching: '获取中',

    // Common
    processing: '处理中...',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    reset: '重置',
    download: '下载',
    pleaseUploadImage: '请先上传图像',
    pleaseSelectImages: '请至少选择一张图像',
    imageTypeError: '请上传图像文件',
    imageSizeError: '图像大小应小于 10MB',
    imageEnhanced: '图像增强成功',

    // Tech Docs
    techDocsTitle: '技术文档',
    sr3DiffusionTitle: 'SR3 扩散模型',
    sr3ForwardProcess: '前向过程',
    sr3ReverseProcess: '逆向（去噪）过程',
    sr3Derivation: '推导心得',
    sr3DerivationText: '扩散过程在 T 个时间步中逐步向图像添加高斯噪声。逆向过程使用学习到的神经网络进行去噪，最终从纯噪声中恢复出高分辨率图像。',
    threeGSTitle: '3D 高斯溅射',
    threeGSRendering: '高斯渲染',
    threeGSSphericalHarmonics: '球谐函数',
    threeGSDerivation: '推导心得',
    threeGSDerivationText: '3DGS 将场景表示为一组 3D 高斯函数，每个高斯函数包含位置、协方差、不透明度和球谐函数系数（用于视角相关颜色）。渲染时，高斯函数按深度排序并进行 alpha 混合。',
    apiEndpointsTitle: 'API 端点',
    sr3Endpoint: 'SR3 端点',
    sr3EndpointCode: 'POST /api/predict/sr_process\n输入：通过 Gradio 客户端上传单张图像\n输出：增强后的高分辨率图像 URL',
    threeGSEndpoint: '3DGS 端点',
    threeGSEndpointCode: 'POST /api/predict/gs_process\n输入：通过 Gradio 客户端上传多张图像\n输出：3D 模型 .ply 文件 URL',

    // API Docs
    apiDocs: 'API 文档',
    apiDocsFooter: '完整 Gradio 客户端实现请参见 frontend/lib/api.ts。',
    input: '输入',
    output: '输出',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, ...args: unknown[]) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');

  const t = useCallback(
    (key: string, ...args: unknown[]): string => {
      const val = translations[locale]?.[key];
      if (typeof val === 'function') {
        return (val as Function)(...args);
      }
      return (val as string) ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
