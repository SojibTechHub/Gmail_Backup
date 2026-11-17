'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';

export interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: 'primary' | 'error' | 'warning' | 'info';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
}

const variantMap: Record<NonNullable<ModalProps['variant']>, NonNullable<React.ComponentProps<typeof Button>['variant']>> = {
  primary: 'primary',
  error: 'error',
  warning: 'accent',
  info: 'secondary',
};

export function Modal({
  isOpen,
  open,
  onClose,
  title,
  children,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  variant = 'primary',
  maxWidth = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeOpen = open ?? isOpen ?? false;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [activeOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth] || maxWidth;

  return (
    <dialog ref={dialogRef} className={clsx('modal', className)}>
      <div className={clsx('modal-box rounded-3xl', widthClass)}>
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="py-4">{children}</div>
        {(onConfirm || cancelText) && (
          <div className="modal-action">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button variant={variantMap[variant]} onClick={onConfirm}>
                {confirmText || 'Confirm'}
              </Button>
            )}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
