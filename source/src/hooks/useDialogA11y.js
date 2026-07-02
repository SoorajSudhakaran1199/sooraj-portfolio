import { useEffect, useRef } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function useDialogA11y(open, onClose, options = {}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const { lockScroll = true } = options;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    const previousActiveElement = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => {
      const firstFocusable = dialog?.querySelector(focusableSelector);
      (firstFocusable || dialog)?.focus?.();
    }, 0);

    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll(focusableSelector))
        .filter((element) => element.offsetParent !== null || element === document.activeElement);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = originalOverflow;
      }
      previousActiveElement?.focus?.();
    };
  }, [lockScroll, open]);

  return dialogRef;
}
