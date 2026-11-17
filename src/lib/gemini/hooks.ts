import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export function useContainerDimensions<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { width, height } = element.getBoundingClientRect();
        setSize(previous => Math.abs(previous.width - width) < 0.5 && Math.abs(previous.height - height) < 0.5 ? previous : { width, height });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return { ref, ...size };
}

export interface SpringPoint { x: number; y: number }
export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  onUpdate: (point: SpringPoint) => void;
}

/** Semi-implicit integration with bounded substeps; interrupted targets retain velocity. */
export function useSpringPhysics({ stiffness = 180, damping = 24, onUpdate }: SpringOptions) {
  const reduced = useReducedMotion();
  const state = useRef({ point: { x: 0, y: 0 }, target: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, frame: 0, last: 0 });
  const update = useRef(onUpdate);
  const settings = useRef({ stiffness, damping, reduced });
  update.current = onUpdate;
  settings.current = { stiffness, damping, reduced };
  const stop = useCallback(() => { cancelAnimationFrame(state.current.frame); state.current.frame = 0; state.current.last = 0; }, []);
  const jump = useCallback((point: SpringPoint) => {
    stop();
    state.current.point = { ...point };
    state.current.target = { ...point };
    state.current.velocity = { x: 0, y: 0 };
    update.current(point);
  }, [stop]);
  const setTarget = useCallback((target: SpringPoint, velocity?: SpringPoint) => {
    const s = state.current;
    s.target = { ...target };
    if (velocity) s.velocity = { ...velocity };
    if (settings.current.reduced) { jump(target); return; }
    if (s.frame) return;
    const tick = (time: number) => {
      const elapsed = s.last ? Math.min((time - s.last) / 1000, 0.032) : 1 / 120;
      s.last = time;
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)));
      const dt = elapsed / steps;
      for (let step = 0; step < steps; step++) {
        for (const axis of ['x', 'y'] as const) {
          s.velocity[axis] += ((s.target[axis] - s.point[axis]) * settings.current.stiffness - s.velocity[axis] * settings.current.damping) * dt;
          s.point[axis] += s.velocity[axis] * dt;
        }
      }
      update.current({ ...s.point });
      const settled = Math.hypot(s.velocity.x, s.velocity.y) < 0.02 && Math.hypot(s.point.x - s.target.x, s.point.y - s.target.y) < 0.02;
      if (settled) { jump(s.target); } else { s.frame = requestAnimationFrame(tick); }
    };
    s.frame = requestAnimationFrame(tick);
  }, [jump]);
  useEffect(() => {
    if (reduced) jump(state.current.target);
    return stop;
  }, [reduced, jump, stop]);
  return { valueRef: state, setTarget, jump, stop };
}

interface Battery extends EventTarget { level: number; charging: boolean }
type BatteryNavigator = Navigator & { getBattery?: () => Promise<Battery> };

/** Canvas work sleeps offscreen, in background tabs, and under reduced motion. */
export function useAnimationCanvas(ref: RefObject<HTMLCanvasElement>, draw: (time: number, width: number, height: number) => void, active = true, maxPixels = 1048576) {
  const reduced = useReducedMotion();
  const callback = useRef(draw);
  callback.current = draw;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    let inView = false;
    let previous = 0;
    let lowPower = false;
    let bounds = canvas.getBoundingClientRect();
    let battery: Battery | undefined;
    let disposed = false;
    const readBattery = () => { lowPower = !!battery && !battery.charging && battery.level < 0.2; };
    (navigator as BatteryNavigator).getBattery?.().then(value => {
      if (disposed) return;
      battery = value;
      readBattery();
      battery.addEventListener('levelchange', readBattery);
      battery.addEventListener('chargingchange', readBattery);
    }).catch(() => undefined);
    const paint = (time: number) => {
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(maxPixels / Math.max(1, bounds.width * bounds.height)));
      const width = Math.round(bounds.width * dpr);
      const height = Math.round(bounds.height * dpr);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      callback.current(time / 1000, width, height);
    };
    const tick = (time: number) => {
      frame = 0;
      if (document.hidden || !inView) return;
      if (time - previous >= (lowPower ? 1000 / 30 : 1000 / 120)) { paint(time); previous = time; }
      if (!reduced && active) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (inView && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; wake(); });
    const resize = new ResizeObserver(() => { bounds = canvas.getBoundingClientRect(); wake(); });
    observer.observe(canvas);
    resize.observe(canvas);
    document.addEventListener('visibilitychange', wake);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); resize.disconnect();
      document.removeEventListener('visibilitychange', wake);
      battery?.removeEventListener('levelchange', readBattery);
      battery?.removeEventListener('chargingchange', readBattery);
    };
  }, [ref, reduced, active, maxPixels]);
}

const VERTEX = 'attribute vec2 a_position; void main(){ gl_Position=vec4(a_position,0.0,1.0); }';
const FRAGMENT = `precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_energy;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(uv-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  float wave=sin(p.x*5.0+sin(p.y*6.0+u_time*0.45)*1.8+u_time*0.4);
  float fluid=sin(p.y*5.0+p.x*2.0-u_time*0.3+wave*1.5);
  float light=exp(-length(uv-u_pointer)*3.0);
  vec3 a=vec3(0.10,0.32,0.50);
  vec3 b=vec3(0.43,0.20,0.78);
  vec3 color=mix(a,b,fluid*0.5+0.5)*(0.3+0.65*light);
  color+=vec3(0.1,0.45,0.48)*pow(abs(wave),12.0)*(0.45+u_energy);
  gl_FragColor=vec4(color,1.0);
}`;

export function useGLSLCanvas(pointer: RefObject<SpringPoint>, energy: RefObject<number>) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pipeline = useRef<{ gl: WebGLRenderingContext; program: WebGLProgram; resolution: WebGLUniformLocation | null; pointer: WebGLUniformLocation | null; time: WebGLUniformLocation | null; energy: WebGLUniformLocation | null } | null>(null);
  const [available, setAvailable] = useState(false);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let gl: WebGLRenderingContext | null = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch { /* CSS surface stays visible. */ }
    if (!gl) return;
    const resources: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      resources.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
      return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const cleanup = () => { pipeline.current = null; resources.forEach(shader => gl!.deleteShader(shader)); if (program) gl!.deleteProgram(program); if (buffer) gl!.deleteBuffer(buffer); };
    if (!vertex || !fragment || !program || !buffer) { cleanup(); return; }
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { cleanup(); return; }
    gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    pipeline.current = { gl, program, resolution: gl.getUniformLocation(program, 'u_resolution'), pointer: gl.getUniformLocation(program, 'u_pointer'), time: gl.getUniformLocation(program, 'u_time'), energy: gl.getUniformLocation(program, 'u_energy') };
    setAvailable(true);
    const lost = (event: Event) => { event.preventDefault(); pipeline.current = null; setAvailable(false); };
    const restored = () => setGeneration(value => value + 1);
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    return () => { canvas.removeEventListener('webglcontextlost', lost); canvas.removeEventListener('webglcontextrestored', restored); cleanup(); };
  }, [generation]);
  useAnimationCanvas(ref, (time, width, height) => {
    const p = pipeline.current;
    if (!p) return;
    p.gl.useProgram(p.program); p.gl.viewport(0, 0, width, height);
    p.gl.uniform2f(p.resolution, width, height);
    p.gl.uniform2f(p.pointer, pointer.current?.x ?? 0.5, 1 - (pointer.current?.y ?? 0.5));
    p.gl.uniform1f(p.time, time); p.gl.uniform1f(p.energy, energy.current ?? 0);
    p.gl.drawArrays(p.gl.TRIANGLES, 0, 6);
  }, available, 131072);
  return { ref, available };
}
