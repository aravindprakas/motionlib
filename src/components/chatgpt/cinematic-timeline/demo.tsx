import { CinematicTimeline } from './CinematicTimeline';
import { timelineFrames } from '@/lib/chatgpt-data';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <CinematicTimeline items={timelineFrames} {...props}/>; }
