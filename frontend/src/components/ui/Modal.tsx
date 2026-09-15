import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'lg' }: ModalProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className={`bg-card border border-border shadow-xl rounded-lg w-full overflow-hidden flex flex-col max-h-full ${maxWidthClasses[maxWidth]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border bg-muted/20 flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
            </div>
            
            <div className="p-5 overflow-y-auto min-h-0">
              {children}
            </div>
            
            {footer && (
              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/10 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
