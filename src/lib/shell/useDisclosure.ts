import { useCallback, useRef, useState } from 'react';

export interface UseDisclosureOptions {
  /** Controlled value. Pass it and the hook stops owning the state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface Disclosure {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * One open/closed state, controlled or uncontrolled, decided by whether `open`
 * was passed. Every overlay in the set (popover, modal, sidebar, mobile nav)
 * takes the same three props and gets the same semantics, so a consumer never
 * has to remember which of them is the one that also needs `onOpenChange`.
 *
 * `onOpenChange` fires on real transitions only — setting open to the value it
 * already has is a no-op, which keeps a parent's effect from looping when it
 * mirrors the callback back into the prop.
 */
export function useDisclosure({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureOptions = {}): Disclosure {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const open = isControlled ? controlled : uncontrolled;

  // Read the live value inside the callbacks without making them change
  // identity on every toggle — these are handed to memoised children.
  const openRef = useRef(open);
  openRef.current = open;
  const controlledRef = useRef(isControlled);
  controlledRef.current = isControlled;
  const changeRef = useRef(onOpenChange);
  changeRef.current = onOpenChange;

  const setOpen = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    if (!controlledRef.current) setUncontrolled(next);
    changeRef.current?.(next);
  }, []);

  const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);
  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);

  return { open, setOpen, toggle, onOpen, onClose };
}
