import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { useDisclosure, type UseDisclosureOptions } from './useDisclosure';

/** What the rail's width should be right now. */
export type SidebarWidth = 'collapsed' | 'resting' | 'peeked';

export interface SidebarState {
  /** Pinned open by the user. Survives the pointer leaving. */
  expanded: boolean;
  setExpanded: (next: boolean) => void;
  toggle: () => void;
  /** Pointer (or keyboard focus) is inside the rail and it has widened. */
  peeked: boolean;
  width: SidebarWidth;
  /** Spread onto the sidebar element. */
  handlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocusCapture: () => void;
    onBlurCapture: (e: FocusEvent<HTMLElement>) => void;
  };
}

export interface UseSidebarStateOptions extends UseDisclosureOptions {
  /** ms the pointer must rest on the rail before it peeks. 0 = immediate. */
  peekDelay?: number;
  /** Disable hover-peek entirely — set it false on coarse pointers. */
  hoverEnabled?: boolean;
}

/**
 * Three widths, not two: collapsed, resting, and hover-peeked.
 *
 * A sidebar that only widens on hover loses everything the moment the pointer
 * leaves, which makes it useless for anything you need to keep reading while
 * working elsewhere. One that only pins costs a click every time you want a
 * glance. Both behaviours live here and compose: peek is transient and never
 * writes to `expanded`, so pinning it open and moving away leaves it open, and
 * peeking a collapsed rail shows it at resting width without un-collapsing it.
 *
 * Keyboard focus entering the rail peeks it too — tabbing through labels you
 * cannot read is the accessibility failure this pattern usually ships with.
 * `onBlurCapture` checks `relatedTarget`, so moving between two items inside the
 * rail does not flicker it shut between them.
 *
 * Nothing here knows a pixel value. The three states are named, and the
 * component maps them to widths, so a consumer can retune the rail without
 * touching the logic.
 */
export function useSidebarState({
  peekDelay = 0,
  hoverEnabled = true,
  ...disclosure
}: UseSidebarStateOptions = {}): SidebarState {
  const { open: expanded, setOpen: setExpanded, toggle } = useDisclosure(disclosure);
  const [peeked, setPeeked] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!hoverEnabled) setPeeked(false);
  }, [hoverEnabled]);

  const peek = useCallback(
    (on: boolean) => {
      if (!hoverEnabled) return;
      window.clearTimeout(timer.current);
      if (!on || peekDelay === 0) setPeeked(on);
      else timer.current = window.setTimeout(() => setPeeked(true), peekDelay);
    },
    [hoverEnabled, peekDelay],
  );

  const onPointerEnter = useCallback(() => peek(true), [peek]);
  const onPointerLeave = useCallback(() => peek(false), [peek]);
  const onFocusCapture = useCallback(() => setPeeked(true), []);
  const onBlurCapture = useCallback((e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPeeked(false);
  }, []);

  const width: SidebarWidth = expanded
    ? peeked
      ? 'peeked'
      : 'resting'
    : peeked
      ? 'resting'
      : 'collapsed';

  return {
    expanded,
    setExpanded,
    toggle,
    peeked,
    width,
    handlers: { onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture },
  };
}
