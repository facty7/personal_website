'use client';

import { useState } from 'react';
import { process3DGS, APIError } from '@/lib/api';
import GsplatViewer from '@/components/GsplatViewer';
import SR3Comparison from '@/components/SR3Comparison';
import { TechDocs } from '@/components/TechDocs';
import { toast } from '@/hooks/useToast';
import { useI18n } from '@/lib/i18n';

export default function Home() {
  const { t } = useI18n();
  const [threedgsImages, setThreedgsImages] = useState<File[]>([]);
  const [threedgsLoading, setThreedgsLoading] = useState(false);
  const [plyUrl, setPlyUrl] = useState<string | null>(null);

  const handleThreedgsImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setThreedgsImages(files);
      setPlyUrl(null);
    }
  };

  const handleThreedgsSubmit = async () => {
    if (threedgsImages.length === 0) {
      toast.error(t('pleaseSelectImages'));
      return;
    }

    setThreedgsLoading(true);
    setPlyUrl(null);

    try {
      const result = await process3DGS(threedgsImages);
      if (result.download_url) {
        setPlyUrl(result.download_url);
        toast.success(result.message);
      } else {
        toast.info(result.message || '3DGS processing started');
      }
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(`API Error (${error.statusCode}): ${error.message}`);
      } else {
        toast.error(`Error: ${(error as Error).message}`);
      }
    } finally {
      setThreedgsLoading(false);
    }
  };

  const handleReset3DGS = () => {
    setThreedgsImages([]);
    setPlyUrl(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="glass rounded-lg p-8 text-center animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2">
          {t('heroTitle')}
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          {t('heroDescription')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SR3 Card - spans 2 cols */}
        <div className="md:col-span-2 animate-fade-in">
          <SR3Comparison />
        </div>

        {/* 3DGS Card - spans 2 cols */}
        <div className="md:col-span-2 glass rounded-lg glow-purple animate-fade-in">
          <div className="p-5">
            <h2 className="text-lg font-bold text-zinc-100 mb-1">{t('gsTitle')}</h2>
            <p className="text-sm text-zinc-400 mb-5">{t('gsDesc')}</p>

            {/* Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleThreedgsImagesChange}
                className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 file:transition-colors"
                disabled={threedgsLoading}
              />
              {threedgsImages.length > 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  {t('selectedImages', threedgsImages.length)}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleThreedgsSubmit}
                disabled={threedgsLoading || threedgsImages.length === 0}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all duration-200"
              >
                {threedgsLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('processing')}
                  </span>
                ) : t('processWith3DGS')}
              </button>
              <button
                onClick={handleReset3DGS}
                disabled={threedgsLoading}
                className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50 transition-colors"
              >
                {t('reset')}
              </button>
            </div>

            {/* 3D Preview */}
            <div className="mt-4">
              {plyUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span>{plyUrl.split('/').pop()}</span>
                    </div>
                    <a
                      href={plyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Open .ply
                    </a>
                  </div>

                  <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <GsplatViewer
                      plyUrl={plyUrl}
                      className="h-80"
                      autoRotate={true}
                      showControls={true}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = plyUrl;
                        link.download = plyUrl.split('/').pop() || 'model.ply';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('downloadPLY')}
                    </button>
                    <button
                      onClick={() => setPlyUrl(null)}
                      className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-sm"
                    >
                      {t('hidePreview')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-800 rounded-lg p-8 text-center bg-zinc-900/30">
                  <div className="w-14 h-14 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-500 mb-1">{t('no3DModel')}</h4>
                  <p className="text-xs text-zinc-600">{t('no3DModelDesc')}</p>
                  <p className="text-xs text-zinc-700 mt-2">{t('previewWillAppear')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TechDocs Card - spans 1 col on md, full on smaller */}
        <div className="md:col-span-2 animate-fade-in">
          <TechDocs />
        </div>

        {/* API Info Card - spans 2 cols on md */}
        <div className="md:col-span-2 glass rounded-lg animate-fade-in">
          <div className="p-5">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">{t('apiDocs')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-mono text-sm font-bold text-blue-400 mb-2">SR3</h4>
                <code className="text-xs text-zinc-400 block mb-2">POST /api/predict/sr_process</code>
                <p className="text-xs text-zinc-500">
                  <span className="text-zinc-400">{t('input')}:</span> Single image file
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="text-zinc-400">{t('output')}:</span> Enhanced image URL
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-mono text-sm font-bold text-purple-400 mb-2">3DGS</h4>
                <code className="text-xs text-zinc-400 block mb-2">POST /api/predict/gs_process</code>
                <p className="text-xs text-zinc-500">
                  <span className="text-zinc-400">{t('input')}:</span> Multiple image files
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="text-zinc-400">{t('output')}:</span> 3D model .ply URL
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-600 font-mono">
              {t('apiDocsFooter')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
