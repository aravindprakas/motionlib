import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { ReactiveAmbientSoundVisualizer } from './ReactiveAmbientSoundVisualizer';
export default function Demo() { return <AuraDemo number="08" title="Reactive ambient sound visualizer" description="Layered spectrum waves refract the canvas. Start with a silent procedural field, or load an audio file to drive it with real Web Audio frequencies."><ReactiveAmbientSoundVisualizer /></AuraDemo>; }
