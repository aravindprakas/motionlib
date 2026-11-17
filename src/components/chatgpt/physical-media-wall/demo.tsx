import { PhysicalMediaWall, type WallMedia } from './PhysicalMediaWall';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
import aetheris from '@/assets/projects/aetheris.jpg';
import helios from '@/assets/projects/helios.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';
import chime from '@/assets/chatgpt/studio-chime.wav';
const items: WallMedia[] = [
  { id: 'architecture', title: 'Light & structure', type: 'image', src: aetheris, aspectRatio: 1.7, caption: 'A study in the spaces between.' },
  { id: 'field-note', title: 'A few things to remember', type: 'document', aspectRatio: .8, caption: 'Notes from the first conversation.', text: 'Clarity is a feature.\n\nA useful interface makes the next action obvious and the consequences understandable.\n\nKeep the object present. Make room for attention. Give every action a way back.\n\nBuild less. Learn sooner. Notice more.\n\nStudio journal · Volume 01' },
  { id: 'morning', title: 'A softer morning', type: 'image', src: helios, aspectRatio: 1.3, caption: 'Warmth, held in geometry.' },
  { id: 'sound', title: 'A little resonance', type: 'audio', src: chime, aspectRatio: 1.5, caption: 'Three notes for a quiet beginning.' },
  { id: 'material', title: 'The shape of a thought', type: 'image', src: meridian, aspectRatio: 1.5, caption: 'Collected from the project archive.' },
  { id: 'stillness', title: 'Still, in motion', type: 'art', seed: 0, aspectRatio: 1.6, caption: 'An original geometric composition.' },
  { id: 'obsidian', title: 'A darker register', type: 'image', src: obsidian, aspectRatio: 1.3, caption: 'An exploration of contrast.' },
  { id: 'vitrum', title: 'Almost transparent', type: 'image', src: vitrum, aspectRatio: 1.5, caption: 'A different way of looking.' },
];
export default function Demo(props: AsyncSurfaceProps) { return <PhysicalMediaWall items={items} {...props}/>; }
