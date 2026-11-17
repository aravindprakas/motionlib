import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Fingerprint, RotateCcw } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';
import { useAnimationCanvas, useContainerDimensions, useSpringPhysics } from '@/lib/gemini/hooks';

export interface BiometricParticleAuthSliderProps { onComplete?: () => void; label?: string }
export function BiometricParticleAuthSlider({ onComplete, label = 'Slide to verify' }: BiometricParticleAuthSliderProps) {
  const { ref, width, height } = useContainerDimensions<HTMLDivElement>();
  const handle = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const pressure = useRef(.5);
  const drag = useRef<{ id: number; start: number; value: number; last: number; time: number; velocity: number } | null>(null);
  const [complete, setComplete] = useState(false);
  const [value, setValue] = useState(0);
  const max = Math.max(0, width - height);
  const spring = useSpringPhysics({ stiffness: 180, damping: 25, onUpdate: point => {
    progress.current = Math.max(0, Math.min(1, point.x));
    if (handle.current) { handle.current.style.transform = `translate3d(${progress.current * max}px,0,0)`; handle.current.setAttribute('aria-valuenow', String(Math.round(progress.current * 100))); handle.current.setAttribute('aria-valuetext', `${Math.round(progress.current * 100)}% verified`); }
  } });
  const verify = () => {
    if (complete) return;
    setComplete(true); setValue(100); spring.setTarget({ x: 1, y: 0 }); onComplete?.();
  };
  useEffect(() => { if (handle.current) handle.current.style.transform = `translate3d(${progress.current * max}px,0,0)`; }, [max]);
  useAnimationCanvas(canvas, (time, w, h) => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const angle = i * 2.399;
      const radius = Math.sqrt(i / 90) * h * .34;
      const drift = (1 - progress.current) * Math.sin(time * 1.8 + i) * h * .12;
      const targetX = w - h / 2 + Math.cos(angle) * radius;
      const targetY = h / 2 + Math.sin(angle) * radius;
      const startX = (i / 90) * (w - h * .2) + Math.sin(i * 13 + time) * h * .12;
      const x = startX * (1 - progress.current) + targetX * progress.current;
      const y = targetY + drift;
      context.fillStyle = complete ? '#8aeeed' : i % 3 ? '#b7a0ff77' : '#8aeeed88';
      context.beginPath(); context.arc(x, y, Math.max(1, h * .018 * (.6 + pressure.current)), 0, Math.PI * 2); context.fill();
    }
  }, !complete);
  return <AuraSurface className="aura-panel aura-stack"><div className="aura-row"><Fingerprint size={28} color="#8aeeed" /><span className="aura-badge">{complete ? 'VERIFIED' : 'AWAITING GESTURE'}</span></div><h2 className="aura-title">A gesture of trust.</h2><p className="aura-label">Drag the particle field into alignment. Use arrow keys, or press Enter to complete.</p>
    <div ref={ref} className="aura-auth-track"><canvas ref={canvas} aria-hidden="true" /><span className="aura-auth-label">{complete ? 'Identity aligned' : label}</span><button ref={handle} className="aura-auth-handle" role="slider" aria-label="Verification progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={complete ? 'Verified' : `${value}% verified`} aria-disabled={complete} onPointerDown={event => {
      if (complete || !max) return;
      spring.stop(); event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, start: event.clientX, value: progress.current, last: event.clientX, time: event.timeStamp, velocity: 0 };
    }} onPointerMove={event => {
      const state = drag.current;
      if (!state || state.id !== event.pointerId || !max) return;
      const next = Math.max(0, Math.min(1, state.value + (event.clientX - state.start) / max));
      state.velocity = (event.clientX - state.last) / max / Math.max(.008, (event.timeStamp - state.time) / 1000);
      state.last = event.clientX; state.time = event.timeStamp; pressure.current = event.pressure || .5;
      spring.jump({ x: next, y: 0 });
    }} onPointerUp={event => {
      const state = drag.current;
      if (!state) return;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      if (progress.current > .84 || (progress.current > .55 && progress.current + state.velocity * .1 > .95)) verify();
      else { setValue(0); spring.setTarget({ x: 0, y: 0 }, { x: Math.max(-3, Math.min(3, state.velocity)), y: 0 }); }
    }} onPointerCancel={() => { drag.current = null; spring.setTarget({ x: complete ? 1 : 0, y: 0 }); }} onLostPointerCapture={() => { if (drag.current) { drag.current = null; spring.setTarget({ x: complete ? 1 : 0, y: 0 }); } }} onKeyDown={event => {
      if (complete) return;
      if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'End' || event.key === 'Enter' || event.key === ' ') { verify(); return; }
        const next = event.key === 'Home' ? 0 : Math.max(0, Math.min(1, progress.current + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? .1 : -.1)));
        if (next >= .99) verify(); else { setValue(Math.round(next * 100)); spring.setTarget({ x: next, y: 0 }); }
      }
    }}>{complete ? <Check size={23} /> : <ArrowRight size={23} />}</button></div>
    <div className="aura-row"><p className="aura-label" role="status">{complete ? 'Verification complete. You’re in.' : 'Gesture preview · no biometric data collected'}</p><button className="aura-icon-button" onClick={() => { setComplete(false); setValue(0); spring.setTarget({ x: 0, y: 0 }); }}><RotateCcw size={14} />Reset</button></div>
  </AuraSurface>;
}
