import { LivingCommandCenter } from './LivingCommandCenter';
import { workspacePanels } from '@/lib/chatgpt-data';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <LivingCommandCenter panels={workspacePanels} {...props}/>; }
