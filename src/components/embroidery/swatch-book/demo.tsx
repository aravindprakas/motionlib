// SwatchBook
import { SwatchBook } from './SwatchBook';

export default function SwatchBookDemo() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        throw the top swatch aside — or use the arrows
      </p>
      <SwatchBook />
    </div>
  );
}
