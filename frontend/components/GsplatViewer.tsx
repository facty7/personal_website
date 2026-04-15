'use client';

import { useEffect, useRef, useState } from 'react';

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
          setError(err instanceof Error ? err.message : 'Failed to load 3D model');
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
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No 3D Model URL</h3>
          <p className="text-gray-500">Provide a .ply file URL to visualize 3D Gaussian Splatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoaded && !loading ? 'block' : 'none' }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="w-12 h-12 mb-4">
            <div className="w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-white font-medium mb-2">Loading 3D Model</h3>
          <p className="text-gray-300 text-sm mb-4">Fetching {plyUrl.split('/').pop()}</p>
          <div className="w-64 bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-300 text-sm mt-2">{progress}%</p>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-2">Failed to Load 3D Model</h3>
          <p className="text-gray-300 text-sm text-center max-w-md mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls info */}
      {isLoaded && showControls && (
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium">Controls:</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-gray-300 w-20">Rotate:</span>
              <span className="font-mono">Drag</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300 w-20">Zoom:</span>
              <span className="font-mono">Scroll</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300 w-20">Pan:</span>
              <span className="font-mono">Right-click + Drag</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-rotation indicator */}
      {isLoaded && autoRotate && !showControls && (
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs rounded-lg p-2 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Auto-rotation: ON</span>
          </div>
        </div>
      )}
    </div>
  );
}