import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AuraSurface, FluidCanvas, AURA_SPRING } from '@/lib/gemini/AuraSurface';
import { useSpringPhysics } from '@/lib/gemini/hooks';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface KineticMatrixShaderButtonProps { label?: string; onClick?: () => void; disabled?: boolean }
export function KineticMatrixShaderButton({ label = 'Enter the matrix', onClick, disabled = false }: KineticMatrixShaderButtonProps) {
  const button = useRef<HTMLButtonElement>(null);
  const pointer = useRef({ x: .5, y: .5 });
  const energy = useRef(0);
  const [text, setText] = useState(label);
  const [burst, setBurst] = useState(0);
  const scramble = useRef<ReturnType<typeof setInterval> | null>(null);
  const press = useRef(0);
  const pressed = useRef(false);
  const frame = useRef(0);
  const reduced = useReducedMotion();
  const spring = useSpringPhysics({ stiffness: 310, damping: 23, onUpdate: point => { if (button.current) button.current.style.transform = `scale(${point.x || 1})`; } });
  const clear = () => { if (scramble.current) clearInterval(scramble.current); scramble.current = null; cancelAnimationFrame(frame.current); };
  useEffect(() => { clear(); setText(label); return clear; }, [label, reduced]);
  const runScramble = () => {
    if (reduced || label.length > 96 || disabled) return;
    if (scramble.current) clearInterval(scramble.current);
    let step = 0;
    const alphabet = '01<>/[]{}+×';
    scramble.current = setInterval(() => {
      step++;
      setText(Array.from(label).map((character, i) => character === ' ' || i < step / 12 * label.length ? character : alphabet[(i * 7 + step * 3) % alphabet.length]).join(''));
      if (step >= 12) { if (scramble.current) clearInterval(scramble.current); scramble.current = null; setText(label); }
    }, 30);
  };
  const release = () => { pressed.current = false; cancelAnimationFrame(frame.current); energy.current = .3; spring.setTarget({ x: 1, y: 0 }); };
  return <AuraSurface className="aura-matrix-wrap"><button ref={button} className="aura-matrix-button" disabled={disabled} aria-label={label} onPointerEnter={runScramble} onPointerMove={event => {
    const bounds = event.currentTarget.getBoundingClientRect(); pointer.current = { x: (event.clientX - bounds.x) / bounds.width, y: (event.clientY - bounds.y) / bounds.height }; energy.current = Math.max(.3, event.pressure);
  }} onPointerLeave={() => { if (!pressed.current) energy.current = 0; }} onPointerDown={event => {
    if (disabled) return;
    pressed.current = true; press.current = performance.now(); event.currentTarget.setPointerCapture(event.pointerId);
    const pressure = event.pressure || .5;
    const tick = () => { if (!pressed.current) return; spring.setTarget({ x: 1 - Math.min(.07, .02 + (performance.now() - press.current) / 12000 + pressure * .02), y: 0 }); frame.current = requestAnimationFrame(tick); };
    tick();
  }} onPointerUp={event => { release(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={release} onLostPointerCapture={release} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') spring.setTarget({ x: .96, y: 0 }); }} onKeyUp={release} onBlur={release} onClick={() => { if (!reduced) setBurst(value => value + 1); runScramble(); onClick?.(); }}><FluidCanvas pointer={pointer} energy={energy} /><span aria-hidden="true">{text}</span><ArrowUpRight size={20} style={{ flexShrink: 0 }} /></button>{burst > 0 && !reduced && <div className="aura-matrix-particles" key={burst} aria-hidden="true">{Array.from({ length: 16 }, (_, index) => { const angle = index / 16 * Math.PI * 2; return <motion.span key={index} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: Math.cos(angle) * 100, y: Math.sin(angle) * 65, scale: 0, opacity: 0 }} transition={{ ...AURA_SPRING, stiffness: 80, damping: 15, delay: index % 3 * .015 }} />; })}</div>}</AuraSurface>;
}
