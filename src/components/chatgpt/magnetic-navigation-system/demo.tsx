import { Compass, FileText, Layers, Settings2 } from 'lucide-react';
import { MagneticNavigationSystem, type MagneticNavItem } from './MagneticNavigationSystem';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
const items: MagneticNavItem[] = [
  { id: 'discover', label: 'Discover', description: 'A little space for the things you haven’t thought of yet. Follow a question. See where it goes.', icon: <Compass size={23}/>, children: [{ id: 'inspiration', label: 'Inspiration', description: 'Collected moments, useful references, and unexpected connections.' }, { id: 'experiments', label: 'Experiments', description: 'Small ideas you can test before committing to a direction.' }] },
  { id: 'projects', label: 'Projects', description: 'Your ideas, finding their shape. Pick up where you left off.', icon: <Layers size={23}/>, children: [{ id: 'active', label: 'In motion', description: 'The work that is moving forward right now.' }, { id: 'archive', label: 'The archive', description: 'Past work, preserved with its lessons intact.' }] },
  { id: 'journal', label: 'Journal', description: 'A record of what we noticed. Good observations have a way of becoming good ideas.', icon: <FileText size={23}/> },
  { id: 'settings', label: 'Settings', description: 'Make the space your own. Small adjustments for the way you think.', icon: <Settings2 size={23}/> },
];
export default function Demo(props: AsyncSurfaceProps) { return <MagneticNavigationSystem items={items} {...props}/>; }
