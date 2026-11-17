// ThreadDrawer
import { ThreadDrawer } from './ThreadDrawer';

export default function ThreadDrawerDemo() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        pick a block, then a thread — the cloth decides whether it reads
      </p>
      <ThreadDrawer />
    </div>
  );
}
