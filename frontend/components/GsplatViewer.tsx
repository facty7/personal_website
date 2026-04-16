'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/useToast';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useI18n } from '@/lib/i18n';

interface GsplatViewerProps {
  plyUrl?: string;
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export default function GsplatViewer({
  plyUrl,
  className = '',
  autoRotate = true,
  showControls = true,
}: GsplatViewerProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !plyUrl) return;

    let mounted = true;

    const initGsplat = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          throw new Error('WebGL is not supported in your browser.');
        }

        const gsplat = await import('gsplat');

        const renderer = new gsplat.WebGLRenderer(canvasRef.current!);
        const scene = new gsplat.Scene();
        const camera = new gsplat.Camera();
        camera.position = new gsplat.Vector3(0, 0, 5);

        let controls: any = null;
        if (showControls) {
          controls = new gsplat.OrbitControls(camera, canvasRef.current!);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
        }

        const splat = await gsplat.Loader.LoadAsync(
          plyUrl,
          scene,
          (p: number) => {
            if (mounted) setProgress(Math.round(p * 100));
          }
        );
        // @ts-ignore
        scene.add(splat);

        let angle = 0;
        const animate = () => {
          if (!mounted) return;

          if (autoRotate && !showControls) {
            angle += 0.005;
            const radius = 5;
            camera.position = new gsplat.Vector3(
              Math.sin(angle) * radius,
              0,
              Math.cos(angle) * radius
            );
          }

          if (showControls && controls) {
            controls.update();
          }

          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        };

        animate();

        if (mounted) {
          setIsLoaded(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load gsplat:', err);
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Failed to load 3D model';
          setError(message);
          toast.error(message);
          setLoading(false);
        }
      }
    };

    initGsplat();

    return () => {
      mounted = false;
    };
  }, [plyUrl, autoRotate, showControls]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!plyUrl) {
    return (
      <SkeletonLoader className={className} lines={2} />
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-zinc-900 ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoaded && !loading ? 'block' : 'none' }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
          <div className="w-12 h-12 mb-4">
            <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-zinc-100 font-medium mb-2">{t('loading3DModel')}</h3>
          <p className="text-zinc-400 text-sm mb-4">{t('fetching')} {plyUrl.split('/').pop()}</p>
          <div className="w-64 bg-zinc-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-zinc-400 text-sm mt-2">{progress}%</p>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-zinc-100 font-medium mb-2">{t('error')}</h3>
          <p className="text-zinc-400 text-sm text-center max-w-md mb-4">{error}</p>
        </div>
      )}

      {/* Controls info */}
      {isLoaded && showControls && (
        <div className="absolute bottom-4 left-4 bg-zinc-900/60 text-zinc-200 text-xs rounded-lg p-3 backdrop-blur-sm border border-zinc-700">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium">{t('controls')}:</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-zinc-400 w-20">{t('rotate')}:</span>
              <span className="font-mono">{t('drag')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-zinc-400 w-20">{t('zoom')}:</span>
              <span className="font-mono">{t('scroll')}</span>
            </div>
            <div className="flex items-center">
              <span className="text-zinc-400 w-20">{t('pan')}:</span>
              <span className="font-mono">{t('rightClickDrag')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-rotation indicator */}
      {isLoaded && autoRotate && !showControls && (
        <div className="absolute top-4 right-4 bg-zinc-900/60 text-zinc-200 text-xs rounded-lg p-2 backdrop-blur-sm border border-zinc-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>{t('autoRotationOn')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
