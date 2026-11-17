// FieldNotes — the journal the archive was written from, read at reading pace
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { useSizeBand } from '@/lib/useSizeBand';
import { FIELD_NOTES, artifactById, type FieldNote } from '@/lib/expedition';

export interface FieldNotesProps {
  notes?: FieldNote[];
  /** Journal title, printed on the spine of the section. */
  title?: string;
  /** Standfirst under the title. */
  standfirst?: string;
  className?: string;
}

/**
 * Craftsmanship explained as a journal, not as a three-step process graphic.
 *
 * "Design, digitise, stitch" tells a customer nothing they could not guess, and
 * it is the format every competitor uses. What actually earns trust is evidence
 * of judgement: four grounds tried before one was chosen, a fill eased ten
 * percent so a knit stops puckering, a piece documented rather than reproduced
 * because wax fights a needle. Those are observations with dates, and the
 * honest format for an observation with a date is a field entry.
 *
 * So the component is an editorial spread with a real reading rhythm: sequence
 * number, date and place stamped in the margin, the observation set at reading
 * width, the technical note in a smaller voice below it, one plate per entry.
 * Entries reveal as they arrive — once, latched, never replayed — which is a
 * reading cue, not an effect: nothing in an entry is hidden until it animates,
 * because the reveal is a transition from a visible resting state.
 *
 * One IntersectionObserver for the whole journal, rooted on the ambient Lenis
 * scroller, doing double duty: it latches the reveal and it drives the spine
 * index. An entry is unobserved the moment it has been seen, so a fifty-entry
 * journal converges to zero observers and zero work.
 */
export function FieldNotes({
  notes = FIELD_NOTES,
  title = 'Field notes',
  standfirst = 'Five entries from the bench. Each one is the reason a later decision looks obvious.',
  className = '',
}: FieldNotesProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 640, wide: 1040 });
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(notes[0]?.id ?? '');
  const entryRefs = useRef(new Map<string, HTMLElement>());
  const streamRef = useRef<HTMLDivElement>(null);

  /**
   * Arm the reveal, and only then.
   *
   * The hidden-until-seen state lives behind this flag rather than on the entry
   * itself, so an environment where the observer never runs — no
   * IntersectionObserver, a throttled background tab, JS that failed to
   * hydrate — renders a complete, readable journal instead of five invisible
   * articles. Set in a layout effect so it lands before first paint and the
   * entries never flash in and back out.
   */
  useLayoutEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      delete el.dataset.armed;
      return;
    }
    el.dataset.armed = 'true';
  }, [reduced]);

  useEffect(() => {
    const root = scrollerRef?.current ?? null;
    const entries = Array.from(entryRefs.current.values());
    if (!entries.length) return;

    // Reduced motion: nothing to reveal, so the observer's only remaining job
    // is the spine index. The reveal state is set once, for everything.
    if (reduced) {
      entries.forEach((el) => {
        el.dataset.seen = 'true';
      });
    }

    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const el = r.target as HTMLElement;
          if (!r.isIntersecting) continue;
          if (!reduced && !el.dataset.seen) {
            el.dataset.seen = 'true';
          }
          // The entry that owns the upper half of the viewport is the one the
          // reader is on. Cheaper and steadier than measuring on scroll.
          if (r.intersectionRatio > 0.35 && el.dataset.noteId) setCurrent(el.dataset.noteId);
        }
      },
      { root, rootMargin: '-10% 0px -35% 0px', threshold: [0, 0.35, 0.8] },
    );
    entries.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [notes, reduced, scrollerRef]);

  return (
    <section ref={rootRef} className={`exp exp-notes ${className}`} aria-labelledby="exp-notes-title">
      <div className="exp-notes__grid exp-section">
        <header className="exp-notes__head">
          <span className="exp-label">Journal · bench record</span>
          <h2 id="exp-notes-title" className="exp-display exp-notes__title">
            {title}
          </h2>
          <p className="exp-body">{standfirst}</p>
        </header>

        {band === 'wide' && (
          <nav className="exp-notes__spine" aria-label="Journal index">
            <ol className="exp-notes__spineList">
              {notes.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#note-${n.id}`}
                    className="exp-notes__spineItem"
                    aria-current={current === n.id ? 'true' : undefined}
                  >
                    <span className="exp-meta">{String(n.seq).padStart(2, '0')}</span>
                    <span className="exp-notes__spineName">{n.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="exp-notes__stream" ref={streamRef}>
          {notes.map((n, i) => {
            const artifact = artifactById(n.artifactId);
            return (
              <article
                key={n.id}
                id={`note-${n.id}`}
                className="exp-notes__entry"
                data-note-id={n.id}
                data-flip={i % 2 === 1 || undefined}
                style={{ '--i': i } as CSSProperties}
                ref={(el) => {
                  if (el) entryRefs.current.set(n.id, el);
                  else entryRefs.current.delete(n.id);
                }}
                aria-labelledby={`note-${n.id}-h`}
              >
                <div className="exp-notes__margin">
                  <span className="exp-notes__seq" aria-hidden="true">
                    {String(n.seq).padStart(2, '0')}
                  </span>
                  <span className="exp-meta">{n.date}</span>
                  <span className="exp-meta">{n.place}</span>
                  <dl className="exp-stamp exp-notes__marginStamp">
                    {n.meta.map((m) => (
                      <div key={m.key} className="exp-notes__marginRow">
                        <dt>{m.key}</dt>
                        <dd>{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <figure className="exp-notes__figure">
                  <ArtifactPlate artifact={artifact} ratio="4 / 3" zoom={0.92} />
                  <figcaption className="exp-meta">
                    {artifact.record.accession} · {artifact.fabric.name}
                  </figcaption>
                </figure>

                <div className="exp-notes__text">
                  <h3 id={`note-${n.id}-h`} className="exp-title exp-notes__heading">
                    {n.heading}
                  </h3>
                  <p className="exp-body exp-notes__observation">{n.observation}</p>
                  <p className="exp-caption exp-notes__technical">
                    <span className="exp-label">Technical note</span>
                    {n.technical}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
