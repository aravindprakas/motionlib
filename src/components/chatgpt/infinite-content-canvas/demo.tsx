import { InfiniteContentCanvas } from './InfiniteContentCanvas';
import { canvasNodes } from '@/lib/chatgpt-data';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <InfiniteContentCanvas nodes={canvasNodes} {...props}/>; }
