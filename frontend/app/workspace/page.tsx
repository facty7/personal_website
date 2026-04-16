'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { processSR3, process3DGS, APIError } from '@/lib/api';
import { toast } from '@/hooks/useToast';
import { ImageCompareSlider } from '@/components/ImageCompareSlider';
import GsplatViewer from '@/components/GsplatViewer';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useI18n } from '@/lib/i18n';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function WorkspacePage() {
  const { t } = useI18n();

  // --- SR3 State ---
  const [srImage, setSrImage] = useState<File | null>(null);
  const [srImageUrl, setSrImageUrl] = useState<string | null>(null);
  const [srResultUrl, setSrResultUrl] = useState<string | null>(null);
  const [srLoading, setSrLoading] = useState(false);
  const srFileRef = useRef<HTMLInputElement>(null);

  // --- 3DGS State ---
  const [gsImages, setGsImages] = useState<File[]>([]);
  const [gsLoading, setGsLoading] = useState(false);
  const [plyUrl, setPlyUrl] = useState<string | null>(null);

  // --- SR3 Handlers ---
  const handleSrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('imageTypeError')); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t('imageSizeError')); return; }
    setSrImage(file);
    setSrImageUrl(URL.createObjectURL(file));
    setSrResultUrl(null);
  };

  const handleSrProcess = async () => {
    if (!srImage) { toast.error(t('pleaseUploadImage')); return; }
    setSrLoading(true);
    try {
      const result = await processSR3(srImage);
      if (result.status === 'success' && result.image_url) {
        setSrResultUrl(result.image_url);
        toast.success(result.message || t('imageEnhanced'));
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      const msg = err instanceof APIError
        ? `API Error (${err.statusCode}): ${err.message}`
        : `Error: ${(err as Error).message}`;
      toast.error(msg);
    } finally {
      setSrLoading(false);
    }
  };

  const handleSrReset = () => {
    setSrImage(null);
    setSrImageUrl(null);
    setSrResultUrl(null);
    if (srFileRef.current) srFileRef.current.value = '';
  };

  // --- 3DGS Handlers ---
  const handleGsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGsImages(Array.from(e.target.files));
      setPlyUrl(null);
    }
  };

  const handleGsProcess = async () => {
    if (gsImages.length === 0) { toast.error(t('pleaseSelectImages')); return; }
    setGsLoading(true);
    setPlyUrl(null);
    try {
      const result = await process3DGS(gsImages);
      if (result.download_url) {
        setPlyUrl(result.download_url);
        toast.success(result.message);
      } else {
        toast.info(result.message || '3DGS processing started');
      }
    } catch (err) {
      const msg = err instanceof APIError
        ? `API Error (${err.statusCode}): ${err.message}`
        : `Error: ${(err as Error).message}`;
      toast.error(msg);
    } finally {
      setGsLoading(false);
    }
  };

  const handleGsReset = () => {
    setGsImages([]);
    setPlyUrl(null);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {t('workspaceTitle')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {t('workspaceDescription')}
        </p>
      </motion.div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* LEFT: Controls Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">

          {/* SR3 Card */}
          <div className="glow-follow rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  SR3
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mb-4">{t('sr3Desc')}</p>

              {/* Upload */}
              <div
                className="relative rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-6 text-center transition-colors hover:border-zinc-500 cursor-pointer"
                onClick={() => srFileRef.current?.click()}
              >
                <input
                  ref={srFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSrUpload}
                  className="hidden"
                  id="sr-upload"
                />
                <svg className="mx-auto h-8 w-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="mt-2 text-xs text-zinc-400">
                  {srImage ? srImage.name : t('uploadImageHint')}
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">{t('uploadImageFormats')}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleSrProcess}
                  disabled={srLoading || !srImage}
                  className="flex-1 rounded-lg bg-blue-600/90 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                >
                  {srLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('processing')}
                    </span>
                  ) : t('enhanceWithSR3')}
                </button>
                {srImage && (
                  <button
                    onClick={handleSrReset}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  >
                    {t('reset')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3DGS Card */}
          <div className="glow-follow rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  3DGS
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mb-4">{t('gsDesc')}</p>

              {/* Upload */}
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGsUpload}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:transition-colors cursor-pointer"
                  disabled={gsLoading}
                />
                {gsImages.length > 0 && (
                  <p className="mt-2 text-[11px] text-zinc-500">
                    {t('selectedImages', gsImages.length)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleGsProcess}
                  disabled={gsLoading || gsImages.length === 0}
                  className="flex-1 rounded-lg bg-purple-600/90 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all"
                >
                  {gsLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('processing')}
                    </span>
                  ) : t('processWith3DGS')}
                </button>
                {gsImages.length > 0 && (
                  <button
                    onClick={handleGsReset}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  >
                    {t('reset')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Full-screen Preview Area */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">

          {/* SR3 Result */}
          {srImageUrl && srResultUrl ? (
            <motion.div variants={itemVariants} className="glow-follow rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-zinc-300">
                    {t('srSuperResolutionApplied')}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <ImageCompareSlider
                  before={srImageUrl}
                  after={srResultUrl}
                  beforeLabel={t('originalImage')}
                  afterLabel={t('enhancedImage')}
                  className="w-full"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="glow-follow rounded-xl border border-zinc-800/60 bg-zinc-900/40 flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">
                {srImageUrl ? t('processing') : t('sr3Title')}
              </h3>
              <p className="text-xs text-zinc-600 max-w-xs">
                {srImageUrl
                  ? t('processing')
                  : t('sr3Desc')}
              </p>
            </motion.div>
          )}

          {/* 3DGS Result */}
          {plyUrl ? (
            <motion.div variants={itemVariants} className="glow-follow rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-zinc-300 font-mono">
                    {plyUrl.split('/').pop()}
                  </span>
                </div>
                <a
                  href={plyUrl}
                  download
                  className="rounded-md bg-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  {t('downloadPLY')}
                </a>
              </div>
              <div className="p-4">
                <div className="rounded-lg border border-zinc-800/60 overflow-hidden">
                  <GsplatViewer
                    plyUrl={plyUrl}
                    className="h-[500px]"
                    autoRotate={true}
                    showControls={true}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="glow-follow rounded-xl border border-zinc-800/60 bg-zinc-900/40 flex flex-col items-center justify-center py-20 text-center">
              {gsLoading ? (
                <>
                  <SkeletonLoader className="w-full max-w-md mx-8 mb-4" lines={3} />
                  <p className="text-xs text-zinc-500 mt-2">{t('loading3DModel')}</p>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
                    <svg className="h-7 w-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">
                    {t('no3DModel')}
                  </h3>
                  <p className="text-xs text-zinc-600 max-w-xs">
                    {t('gsDesc')}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
