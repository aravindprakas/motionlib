// InteractiveHoverButton
import { InteractiveHoverButton } from './InteractiveHoverButton';

export default function InteractiveHoverButtonDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-16 px-10">
      <div>
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">default</p>
        <InteractiveHoverButton>Hover Me</InteractiveHoverButton>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">
          swapped label · origin · speed
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <InteractiveHoverButton hoverLabel="Let's talk">Start a project</InteractiveHoverButton>
          <InteractiveHoverButton from="right" icon="←" hoverLabel="Back">
            Return
          </InteractiveHoverButton>
          <InteractiveHoverButton from="center" icon={null} duration={650}>
            Slow flood
          </InteractiveHoverButton>
        </div>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">
          scales with type — sizing is all em-based
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <InteractiveHoverButton className="!text-[10px]">Small</InteractiveHoverButton>
          <InteractiveHoverButton className="!text-sm">Medium</InteractiveHoverButton>
          <InteractiveHoverButton className="!text-lg">Large</InteractiveHoverButton>
        </div>
      </div>
    </div>
  );
}
