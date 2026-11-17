import { MorphingDataExplorer } from './MorphingDataExplorer';
import { explorerData } from '@/lib/chatgpt-data';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <MorphingDataExplorer data={props.state === 'partial' ? [...explorerData.slice(0, 5), { ...explorerData[5], value: null }] : explorerData} {...props}/>; }
