import { ContextualDetailLens } from './ContextualDetailLens';
import { lensItems } from '@/lib/chatgpt-data';
import type { AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) { return <ContextualDetailLens items={lensItems} {...props}/>; }
