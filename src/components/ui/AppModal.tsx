import { ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

let openModalCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (openModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  openModalCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
}

function getFocusable(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
}

export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  bodyClassName = '',
  footerClassName = '',
}: AppModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    lockBodyScroll();
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusable(dialogRef.current);
      (focusable[0] || dialogRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusable(dialogRef.current);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
      previousFocusRef.current?.focus?.();
    };
  }, [closeOnEscape, isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const sizeStyles: Record<ModalSize, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-3xl',
    xl: 'sm:max-w-6xl',
    fullscreen: 'sm:max-w-[min(1400px,96vw)] sm:h-[min(920px,92dvh)]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/65 backdrop-blur-[6px]"
        aria-label="Close modal"
        tabIndex={-1}
        onMouseDown={() => {
          if (closeOnBackdrop) onClose();
        }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative flex h-[100dvh] max-h-[100dvh] w-full min-w-0 flex-col overflow-hidden rounded-none border border-slate-200/80 bg-white shadow-2xl outline-none sm:h-auto sm:max-h-[90dvh] sm:w-full sm:max-w-[95vw] sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900 ${sizeStyles[size]} ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 dark:border-slate-700 dark:bg-slate-900/95">
            <h2
              id={titleId}
              className="min-w-0 truncate text-lg font-semibold leading-tight text-slate-900 sm:text-xl dark:text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close modal"
            >
              <i className="ri-close-line text-2xl" />
            </button>
          </div>
        )}

        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-5 [scrollbar-gutter:stable] sm:px-6 ${bodyClassName}`}
        >
          {children}
        </div>

        {footer && (
          <div
            className={`sticky bottom-0 z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end sm:gap-3 sm:px-6 dark:border-slate-700 dark:bg-slate-900/95 ${footerClassName}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export type { AppModalProps, ModalSize };
