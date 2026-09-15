import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'warning':
        return 'bg-amber-600 text-white hover:bg-amber-700';
      case 'info':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  const footer = (
    <>
      <button 
        onClick={onClose}
        className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
      >
        {cancelLabel}
      </button>
      <button 
        onClick={handleConfirm}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getVariantStyles()}`}
      >
        {confirmLabel}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="sm">
      <div className="flex gap-4 text-sm text-muted-foreground">
        {variant === 'danger' && (
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
        )}
        <div className="pt-1">
          {message}
        </div>
      </div>
    </Modal>
  );
}
