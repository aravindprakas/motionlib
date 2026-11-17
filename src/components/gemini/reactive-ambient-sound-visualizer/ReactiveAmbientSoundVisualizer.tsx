import { useEffect, useRef, useState } from 'react';
import { AudioLines, Pause, Play, Upload } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';
import { useAnimationCanvas } from '@/lib/gemini/hooks';
import { useReducedMotion } from '@/lib/useReducedMotion';

export function ReactiveAmbientSoundVisualizer({ label = 'The shape of sound' }: { label?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const context = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const data = useRef(new Uint8Array(128));
  const url = useRef<string | null>(null);
  const mounted = useRef(true);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<'procedural' | 'audio'>('procedural');
  const [gain, setGain] = useState(.65);
  const [status, setStatus] = useState('Procedural spectrum · silent by default');
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; audio.current?.pause(); source.current?.disconnect(); analyser.current?.disconnect(); void context.current?.close().catch(() => undefined); context.current = null; analyser.current = null; source.current = null; if (url.current) URL.revokeObjectURL(url.current); };
  }, []);
  useAnimationCanvas(canvas, (time, width, height) => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (mode === 'audio' && analyser.current) analyser.current.getByteFrequencyData(data.current);
    const count = 64; const gap = width / count; const center = height * .58;
    const gradient = ctx.createLinearGradient(0, height, width, 0); gradient.addColorStop(0, '#87eae6'); gradient.addColorStop(.5, '#a29aef'); gradient.addColorStop(1, '#e7a2df');
    ctx.strokeStyle = gradient; ctx.lineWidth = Math.max(1, width / 600);
    for (let layer = 0; layer < 4; layer++) {
      ctx.globalAlpha = .18 + layer * .12; ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const amplitude = mode === 'audio' ? (data.current[Math.min(127, i * 2)] ?? 0) / 255 : (.25 + .5 * Math.abs(Math.sin(time * .7 + i * .18) * Math.cos(i * .07 - time * .4)));
        const y = center + Math.sin(i * .11 + time * .3 + layer * .5) * amplitude * height * .38 * gain;
        if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * gap, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = gradient;
    for (let i = 0; i < count; i++) {
      const value = mode === 'audio' ? (data.current[i * 2] ?? 0) / 255 : (.15 + .65 * Math.abs(Math.sin(time + i * .19) * Math.cos(time * .3 - i * .07)));
      const barHeight = Math.max(height * .008, value * height * .35 * gain);
      ctx.globalAlpha = .5 + value * .5; ctx.fillRect(i * gap + gap * .24, center - barHeight / 2, gap * .35, barHeight);
    }
  }, playing);
  const load = async (selected: File) => {
    const player = audio.current; if (!player) return;
    player.pause();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = URL.createObjectURL(selected); player.src = url.current; player.volume = .5;
    try {
      if (!context.current) {
        context.current = new AudioContext(); analyser.current = context.current.createAnalyser(); analyser.current.fftSize = 256;
        source.current = context.current.createMediaElementSource(player); source.current.connect(analyser.current); analyser.current.connect(context.current.destination);
      }
      await context.current.resume(); await player.play();
      if (mounted.current) { setMode('audio'); setPlaying(true); setStatus(`Playing ${selected.name}`); }
    } catch {
      player.pause(); if (mounted.current) { setMode('procedural'); setPlaying(true); setStatus('Audio unavailable · procedural spectrum active'); }
    }
  };
  const toggle = async () => {
    if (mode === 'audio' && audio.current) {
      if (playing) audio.current.pause();
      else { try { await context.current?.resume(); await audio.current.play(); } catch { setMode('procedural'); setStatus('Playback unavailable · procedural spectrum active'); } }
    }
    setPlaying(value => !value);
  };
  return <AuraSurface className="aura-stack"><div className="aura-visualizer"><canvas ref={canvas} role="img" aria-label={`${label}: ${mode === 'audio' ? 'audio file frequencies' : 'synthetic spectrum'}`} /><div className="aura-visualizer-caption aura-row"><span className="aura-badge"><AudioLines size={14} />{mode === 'audio' ? 'AUDIO SPECTRUM' : 'PROCEDURAL SPECTRUM'}</span><span className="aura-eyebrow">{reduced ? 'STILL FRAME' : playing ? 'LIVE' : 'PAUSED'}</span></div></div><div className="aura-row"><h2 className="aura-title">{label}</h2><div className="aura-actions"><button className="aura-icon-button" onClick={() => void toggle()} aria-label={playing ? 'Pause visualizer' : 'Play visualizer'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button><button className="aura-icon-button" onClick={() => file.current?.click()}><Upload size={16} />Load audio</button><button className="aura-icon-button" onClick={() => { audio.current?.pause(); setMode('procedural'); setPlaying(true); setStatus('Procedural spectrum · silent by default'); }}>Synthetic</button></div></div><input ref={file} type="file" accept="audio/*" className="sr-only" tabIndex={-1} aria-label="Choose an audio file" onChange={event => { const selected = event.target.files?.[0]; if (selected) void load(selected); event.target.value = ''; }} /><audio ref={audio} onEnded={() => { setPlaying(false); setStatus('Audio complete'); }} onError={() => { setMode('procedural'); setPlaying(true); setStatus('Could not read audio · procedural spectrum active'); }} /><label className="aura-label aura-stack">Surface intensity<input className="aura-range" type="range" min={.1} max={1} step={.01} value={gain} onChange={event => setGain(Number(event.target.value))} /></label><p className="aura-label" role="status">{status}</p></AuraSurface>;
}
