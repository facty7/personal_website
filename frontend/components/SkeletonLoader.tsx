'use client';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
}

export function SkeletonLoader({ className = '', lines = 3 }: SkeletonLoaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-zinc-800 ${className}`}>
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        }}
      />

      {/* Skeleton content */}
      <div className="relative p-6 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-zinc-700 rounded animate-pulse"
            style={{
              width: `${60 + (i % 3) * 15}%`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
