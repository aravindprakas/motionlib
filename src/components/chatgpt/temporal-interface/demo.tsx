import { TemporalInterface } from './TemporalInterface';
import { projectConsequences } from '@/lib/chatgpt-data';
import { SurfaceState, type AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <SurfaceState {...props}><TemporalInterface project={projectConsequences}/><p className="cg-model-note">An illustrative planning model. Change the projection function to use your own data.</p></SurfaceState>; }
