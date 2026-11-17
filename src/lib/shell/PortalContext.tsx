import { createContext, useContext, type ReactNode } from 'react';

const PortalContext = createContext<HTMLElement | null>(null);

export interface ShellPortalProviderProps {
  /** The element overlays should be portalled into. */
  container: HTMLElement | null;
  children: ReactNode;
}

/**
 * Where the set's overlays land.
 *
 * Portalling to `document.body` is the right default — it escapes every
 * ancestor's `overflow` and stacking context, which is the whole reason a
 * popover is portalled at all. But it also escapes the theme: a `.dark` class
 * on a wrapper cannot reach a panel that is no longer inside that wrapper, so a
 * dropdown opened in a dark app renders light. It is a bug you only see once
 * theming becomes scoped rather than global, and then you see it everywhere.
 *
 * This lets a themed subtree nominate its own portal target. Without a provider
 * the hook returns `null` and consumers fall back to `document.body`, so a
 * component copied out of this repo on its own still works exactly as expected.
 */
export function ShellPortalProvider({ container, children }: ShellPortalProviderProps) {
  return <PortalContext.Provider value={container}>{children}</PortalContext.Provider>;
}

/** The nearest nominated portal target, or `null` to mean `document.body`. */
export function useShellPortal(): HTMLElement | null {
  return useContext(PortalContext);
}
