import React from 'react';
import { Theme } from '../types';

interface CircularProgressBarProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  centerTitle?: string;
  centerValue?: string;
  centerSubtitle?: string;
  statusBadge?: {
    label: string;
    variant: 'emerald' | 'amber' | 'cyan' | 'teal';
  };
  colorVariant?: 'emerald' | 'gold' | 'teal' | 'cyan';
  theme?: Theme;
  animate?: boolean;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size = 200,
  strokeWidth = 14,
  centerTitle,
  centerValue,
  centerSubtitle,
  statusBadge,
  colorVariant = 'emerald',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Gradient stops based on colorVariant
  const getGradientColors = () => {
    switch (colorVariant) {
      case 'gold':
        return { start: '#f59e0b', mid: '#fbbf24', end: '#d97706', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'teal':
        return { start: '#0d9488', mid: '#14b8a6', end: '#06b6d4', glow: 'rgba(20, 184, 166, 0.4)' };
      case 'cyan':
        return { start: '#06b6d4', mid: '#38bdf8', end: '#0284c7', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'emerald':
      default:
        return { start: '#059669', mid: '#10b981', end: '#34d399', glow: 'rgba(16, 185, 129, 0.45)' };
    }
  };

  const colors = getGradientColors();
  const gradId = `circle-grad-${colorVariant}-${size}`;
  const glowId = `circle-glow-${colorVariant}-${size}`;

  // Quarter marker points
  const markers = [0, 25, 50, 75, 100];

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>

          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor={colors.glow}
            />
          </filter>
        </defs>

        {/* Outer subtle guide track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth / 2 + 2}
          fill="none"
          stroke={isDark ? 'rgba(51, 65, 85, 0.25)' : 'rgba(226, 232, 240, 0.6)'}
          strokeWidth="1"
          strokeDasharray="2 6"
        />

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 1)'}
          strokeWidth={strokeWidth}
        />

        {/* Active progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Inner subtle decorative ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2 - 3}
          fill="none"
          stroke={isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.7)'}
          strokeWidth="1"
        />
      </svg>

      {/* Center Label Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
        {statusBadge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
              statusBadge.variant === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : statusBadge.variant === 'amber'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : statusBadge.variant === 'cyan'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
            }`}
          >
            {statusBadge.label}
          </span>
        )}

        {centerTitle && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
            {centerTitle}
          </span>
        )}

        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {centerValue || `${percentage.toFixed(1)}%`}
          </span>
        </div>

        {centerSubtitle && (
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 max-w-[140px] truncate">
            {centerSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};
