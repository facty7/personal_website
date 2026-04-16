'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCompareSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ImageCompareSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false });
  const containerRef = useRef<HTMLDivElement>(null);

  // Cache-bust URLs to prevent stale browser cache (only if not already cached)
  const [cacheBust] = useState(() => Date.now());
  const beforeSrc = before.startsWith('blob:') ? before : (before.includes('?') ? `${before}&_t=${cacheBust}` : `${before}?_t=${cacheBust}`);
  const afterSrc = after.startsWith('blob:') ? after : (after.includes('?') ? `${after}&_t=${cacheBust}` : `${after}?_t=${cacheBust}`);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    };
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updatePosition]);

  // Reset slider position when images change
  useEffect(() => {
    setSliderPosition(50);
    setImagesLoaded({ before: false, after: false });
  }, [before, after]);

  const clipLeft = `${100 - sliderPosition}%`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg cursor-col-resize select-none bg-zinc-900 ${className}`}
      style={{ aspectRatio: '4 / 3' }}
    >
      {/* Loading placeholder */}
      {(!imagesLoaded.before || !imagesLoaded.after) && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading images...</span>
          </div>
        </div>
      )}

      {/* After image (fills entire container) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
        onLoad={() => setImagesLoaded(prev => ({ ...prev, after: true }))}
        onError={() => setImagesLoaded(prev => ({ ...prev, after: true }))}
        style={{ opacity: imagesLoaded.after ? 1 : 0 }}
      />

      {/* Before image (clipped to left portion) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `inset(0 ${clipLeft} 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="w-full h-full object-contain"
          draggable={false}
          onLoad={() => setImagesLoaded(prev => ({ ...prev, before: true }))}
          onError={() => setImagesLoaded(prev => ({ ...prev, before: true }))}
          style={{ opacity: imagesLoaded.before ? 1 : 0 }}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label="Image comparison slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSliderPosition(p => Math.max(p - 2, 0));
          if (e.key === 'ArrowRight') setSliderPosition(p => Math.min(p + 2, 100));
        }}
      >
        {/* Left arrow */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        {/* Drag grip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-zinc-800" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM5 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
          </svg>
        </div>
        {/* Right arrow */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 glass rounded px-2 py-1 text-xs font-medium text-zinc-200 z-20 pointer-events-none">
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 glass rounded px-2 py-1 text-xs font-medium text-zinc-200 z-20 pointer-events-none">
        {afterLabel}
      </div>
    </div>
  );
}
