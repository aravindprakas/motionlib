import type { WorkspacePanel } from '@/components/chatgpt/living-command-center/LivingCommandCenter';
import type { TimelineFrame } from '@/components/chatgpt/cinematic-timeline/CinematicTimeline';
import type { ExplorerDatum } from '@/components/chatgpt/morphing-data-explorer/MorphingDataExplorer';
import type { CanvasNode } from '@/components/chatgpt/infinite-content-canvas/InfiniteContentCanvas';
import type { LensItem } from '@/components/chatgpt/contextual-detail-lens/ContextualDetailLens';
import type { Consequence } from '@/components/chatgpt/temporal-interface/TemporalInterface';

export const workspacePanels: WorkspacePanel[] = [
  { id: 'in-motion', title: 'In motion', subtitle: 'THE WORK', value: '08', change: 'Three things worth your attention today.', items: [{ id: 'system', label: 'A quieter design system', detail: 'Design · Today' }, { id: 'prototype', label: 'Prototype the next chapter', detail: 'Build · Tomorrow' }, { id: 'research', label: 'Listen before we make', detail: 'Research · Complete', done: true }] },
  { id: 'momentum', title: 'Momentum', subtitle: 'THE SIGNAL', value: '+24%', change: 'A little further than last week.', items: [{ id: 'cycle', label: 'Cycle 04', detail: 'On track' }, { id: 'quality', label: 'Quality review', detail: '94 / 100' }] },
  { id: 'people', title: 'Good company', subtitle: 'THE PEOPLE', value: '06', change: 'Different perspectives. Shared direction.', items: [{ id: 'mira', label: 'Mira Chen', detail: 'Design' }, { id: 'julian', label: 'Julian Park', detail: 'Engineering' }] },
];
export const timelineFrames: TimelineFrame[] = [
  { id: 'observe', title: 'First, pay attention.', chapter: '01 — Observe', date: 'FEB 03', description: 'Every useful thing begins with a question. We spent the first week watching the work, listening to the people, and noticing what got in the way.', seed: 0 },
  { id: 'question', title: 'A better question.', chapter: '02 — Reframe', date: 'FEB 12', description: 'What if a workspace could make room for thought? The brief shifted from adding features to creating clarity.', seed: 1 },
  { id: 'explore', title: 'Make room for possibility.', chapter: '03 — Explore', date: 'FEB 21', description: 'Twelve small experiments. Three unexpected connections. One direction that felt inevitable once we found it.', seed: 2 },
  { id: 'shape', title: 'Give the idea a shape.', chapter: '04 — Shape', date: 'MAR 04', description: 'A prototype turns a conversation into something you can hold. We made the smallest thing that could answer the biggest question.', seed: 3 },
  { id: 'test', title: 'Let the work speak.', chapter: '05 — Test', date: 'MAR 15', description: 'Real people, real tasks. The friction told us what to refine. The moments of ease told us what to keep.', seed: 0 },
  { id: 'refine', title: 'Less, but more considered.', chapter: '06 — Refine', date: 'MAR 28', description: 'We tuned the details that make a tool feel like an extension of your thinking: focus, timing, space, and recovery.', seed: 1 },
  { id: 'release', title: 'A beginning, not an ending.', chapter: '07 — Release', date: 'APR 08', description: 'The first release went out quietly. The feedback came back clearly. The next chapter is already taking shape.', seed: 2 },
];
export const explorerData: ExplorerDatum[] = [
  { id: 'direct', label: 'Direct', category: 'Organic', value: 8420, previous: 7280 }, { id: 'search', label: 'Search', category: 'Organic', value: 6180, previous: 5800 }, { id: 'journal', label: 'The journal', category: 'Editorial', value: 3920, previous: 2450 }, { id: 'newsletter', label: 'Newsletter', category: 'Editorial', value: 2870, previous: 1900 }, { id: 'community', label: 'Community', category: 'Referral', value: 2140, previous: 2210 }, { id: 'partners', label: 'Partners', category: 'Referral', value: 1560, previous: 1200 }, { id: 'campaign', label: 'Spring campaign', category: 'Paid', value: 980, previous: 740 }, { id: 'social', label: 'Social', category: 'Paid', value: 640, previous: 700 },
];
export const canvasNodes: CanvasNode[] = [
  { id: 'north', title: 'A north star', text: 'Make something useful feel inevitable.', x: 0, y: 0, color: 'sage', kind: 'INTENTION' },
  { id: 'notes', title: 'What we heard', text: '“Give me a little more room to think.”', x: 300, y: 24, color: 'clay', kind: 'FIELD NOTE' },
  { id: 'next', title: 'The next good thing', text: 'A workspace that understands attention.', x: 600, y: 0, color: 'blue', kind: 'POSSIBILITY' },
  { id: 'principles', title: 'A few principles', text: 'Clarity. Continuity. A way back.', x: 120, y: 240, color: 'blue', kind: 'FOUNDATION' },
  { id: 'experiment', title: 'Small experiments', text: 'Build less. Learn sooner. Notice more.', x: 456, y: 264, color: 'sage', kind: 'PROCESS' },
  { id: 'later', title: 'For another day', text: 'Some ideas need a little more time.', x: 792, y: 240, color: 'clay', kind: 'OPEN QUESTION' },
];
export const lensItems: LensItem[] = [
  { id: 'stillness', title: 'A study in stillness', label: '01 / COMPOSITION', summary: 'The space between objects is part of the work.', seed: 0, sections: [{ title: 'The idea', body: 'A composition built around restraint. Three simple geometries establish a rhythm; the empty ground gives that rhythm room to breathe. The work asks how little is needed to make a scene feel complete.' }, { title: 'Material', body: 'Mineral greens, warm paper, and a single dense charcoal shape. The artwork is drawn locally as scalable geometry, so it stays precise at every size.' }, { title: 'Process', body: 'Begin with one anchor. Add a counterweight. Remove anything that does not change the balance. The final piece is the result of subtraction.' }] },
  { id: 'distance', title: 'A sense of distance', label: '02 / PERSPECTIVE', summary: 'Depth without decoration. A quieter horizon.', seed: 1, sections: [{ title: 'The idea', body: 'Distance can be expressed through relationships rather than effects. A near shape, a far shape, and their overlap make the scene legible without a single shadow.' }, { title: 'Material', body: 'Slate blue and fog grey create a cool, open ground. A dark foreground anchors the eye while the circular horizon suggests the wider world beyond.' }] },
  { id: 'warmth', title: 'Held in the light', label: '03 / MATERIAL', summary: 'An ordinary shape made particular by its color.', seed: 2, sections: [{ title: 'The idea', body: 'Clay, copper, and sunlit paper. This study explores how color can imply material without borrowing the appearance of another surface.' }, { title: 'Material', body: 'Three warm tones are registered to the same geometric vocabulary as the other studies. The relationships stay stable as the material changes.' }] },
  { id: 'balance', title: 'Almost in balance', label: '04 / TENSION', summary: 'The most interesting moment is just before equilibrium.', seed: 3, sections: [{ title: 'The idea', body: 'The shapes almost settle. A subtle offset gives the scene a feeling of potential, like an object waiting to find its final place.' }, { title: 'Process', body: 'This is a study in the difference between visual symmetry and perceptual balance. Exact alignment was less useful than the feeling of things belonging together.' }] },
];
export function projectConsequences(allocation: number, horizon: number): Consequence[] {
  return [
    { label: 'Ideas discovered', value: 2 + allocation * .035 * horizon, unit: 'ideas', favorable: 'higher', uncertainty: 1 + horizon * .3 },
    { label: 'Delivery capacity', value: (100 - allocation * .48) * (1 + horizon * .008), unit: '%', favorable: 'higher', uncertainty: horizon * .55 },
    { label: 'Future rework', value: Math.max(2, 28 - allocation * .16 - horizon * .35), unit: 'hours', favorable: 'lower', uncertainty: 1 + horizon * .4 },
  ];
}
