// ComicText
import { ComicText } from './ComicText';

export default function ComicTextDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-16 px-10 py-16">
      <div>
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">default — pops on view</p>
        <ComicText fontSize={5}>BOOM!</ComicText>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">with impact burst</p>
        <ComicText fontSize={4} burst color="#7b6cf6" dotColor="#ece6d8" burstColor="#e8a23d">
          POW
        </ComicText>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">hover to re-pop · tighter halftone</p>
        <div className="flex flex-wrap items-center gap-10">
          <ComicText fontSize={2.5} trigger="hover" dotSize={5} color="#2f9e7f" dotColor="#0c0b0e" tilt={3}>
            ZAP
          </ComicText>
          <ComicText fontSize={2.5} trigger="hover" dotSize={5} color="#ff4d23" dotColor="#0c0b0e" tilt={-7}>
            WHAM
          </ComicText>
          <ComicText fontSize={2.5} trigger="hover" dotSize={5} color="#ece6d8" dotColor="#ff4d23" tilt={6}>
            CRASH
          </ComicText>
        </div>
      </div>
    </div>
  );
}
