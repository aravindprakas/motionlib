import { Component, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useGLSLCanvas, type SpringPoint } from '@/lib/gemini/hooks';
import '@/lib/gemini/aura.css';

export const AURA_SPRING = { type: 'spring', stiffness: 210, damping: 26, mass: 0.8 } as const;

export class AuraBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="aura aura-panel aura-fallback" role="alert"><p>This surface could not be displayed.</p><button className="aura-button" onClick={() => this.setState({ failed: false })}>Try again</button></div>;
    return this.props.children;
  }
}

export function AuraSurface({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <AuraBoundary><div className={`aura ${className}`} style={style}>{children}</div></AuraBoundary>;
}

export function FluidCanvas({ pointer, energy, className = '' }: { pointer?: RefObject<SpringPoint>; energy?: RefObject<number>; className?: string }) {
  const defaultPointer = useRef({ x: 0.5, y: 0.5 });
  const defaultEnergy = useRef(0);
  const shader = useGLSLCanvas(pointer ?? defaultPointer, energy ?? defaultEnergy);
  return <div className={`aura-fluid ${className}`} data-renderer={shader.available ? 'webgl' : 'css'} aria-hidden="true"><canvas ref={shader.ref} style={{ opacity: shader.available ? 1 : 0 }} /></div>;
}
