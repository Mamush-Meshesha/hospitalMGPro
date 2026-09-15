import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ label, variant = 'default', className = '' }: StatusBadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border';
  
  const variants = {
    default: 'bg-muted text-muted-foreground border-border',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    destructive: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
}
