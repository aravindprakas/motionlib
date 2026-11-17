import { Marquee } from './Marquee';

export default function MarqueeDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10">
      <p className="px-10 font-mono text-xs uppercase tracking-[0.3em]">css keyframe marquee — hover to pause</p>
      <Marquee speed={28} className="border-y border-ink bg-accent py-2.5 font-mono text-xs font-bold tracking-[0.16em]">
        <span className="px-[22px]">FREE SHIPPING OVER ₹999 ✳ 30-DAY RETURNS ✳ MEMBERS GET EARLY ACCESS ✳&nbsp;</span>
      </Marquee>
      <Marquee speed={40} className="border-y border-ink">
        <span className="px-7 font-serif text-[clamp(32px,4.5vw,60px)] italic">
          ON RECORD · BEST SELLERS · ON RECORD · BEST SELLERS ·&nbsp;
        </span>
      </Marquee>
      <p className="px-10 font-serif text-lg italic">
        Pure CSS: children rendered twice, translateX(−50%) loop. For scroll-velocity reactivity, see VelocityMarquee.
      </p>
    </div>
  );
}
