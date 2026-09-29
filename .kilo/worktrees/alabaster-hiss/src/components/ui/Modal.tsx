'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        'fixed inset-0 z-50 m-auto rounded-2xl border border-slate-700 bg-slate-800 p-0 shadow-2xl',
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        sizeClasses[size],
        'w-full'
      )}
      onClose={onClose}
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
        {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </Button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
