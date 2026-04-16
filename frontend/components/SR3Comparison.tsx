'use client';

import { useState, useRef } from 'react';
import { processSR3, APIError } from '@/lib/api';
import { toast } from '@/hooks/useToast';
import { ImageCompareSlider } from '@/components/ImageCompareSlider';
import { useI18n } from '@/lib/i18n';

interface SR3ComparisonProps {
  className?: string;
}

export default function SR3Comparison({ className = '' }: SR3ComparisonProps) {
  const { t } = useI18n();
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('imageTypeError'));
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('imageSizeError'));
      return;
    }

    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setEnhancedImageUrl(null);
  };

  const handleProcess = async () => {
    if (!originalImage) {
      toast.error(t('pleaseUploadImage'));
      return;
    }

    setLoading(true);

    try {
      // Process image through SR3
      const result = await processSR3(originalImage);

      if (result.status === 'success' && result.image_url) {
        const imageUrl = result.image_url;
        // URL is relative (proxied via Next.js rewrites), use directly
        setEnhancedImageUrl(imageUrl);
        toast.success(result.message || t('imageEnhanced'));
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      if (err instanceof APIError) {
        toast.error(`API Error (${err.statusCode}): ${err.message}`);
      } else if (err instanceof Error) {
        toast.error(`Error: ${err.message}`);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setEnhancedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`glass rounded-lg glow-blue animate-fade-in ${className}`}>
      <div className="p-5">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">{t('sr3Title')}</h2>
        <p className="text-sm text-zinc-400 mb-5">{t('sr3Desc')}</p>

        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-zinc-300">{t('uploadImage')}</label>
            {originalImage && (
              <button
                onClick={handleReset}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                type="button"
              >
                {t('reset')}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="border border-zinc-700 rounded-lg p-5 text-center hover:border-zinc-500 transition-colors bg-zinc-900/50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="sr3-upload"
                />
                <label
                  htmlFor="sr3-upload"
                  className="cursor-pointer block"
                >
                  <div className="mx-auto w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    {originalImage ? originalImage.name : t('uploadImageHint')}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {t('uploadImageFormats')}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleProcess}
                disabled={loading || !originalImage}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processing')}
                  </span>
                ) : t('enhanceWithSR3')}
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        {originalImageUrl && enhancedImageUrl && (
          <div className="mb-6">
            <ImageCompareSlider
              before={originalImageUrl}
              after={enhancedImageUrl}
              beforeLabel={t('originalImage')}
              afterLabel={t('enhancedImage')}
              className="w-full"
            />
          </div>
        )}

        {/* Info */}
        <div className="pt-4 border-t border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">{t('sr3HowItWorksTitle')}</h4>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• {t('sr3HowItWorks1')}</li>
            <li>• {t('sr3HowItWorks2')}</li>
            <li>• {t('sr3HowItWorks3')}</li>
            <li>• {t('sr3HowItWorks4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
