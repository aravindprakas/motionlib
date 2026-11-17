// ui-105 — FileDropzone
import { FileDropzone } from './FileDropzone';

export default function FileDropzoneDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">drag · drop · browse</p>
        <FileDropzone className="w-full" />
        <p className="max-w-md text-center font-serif text-lg italic">
          Drop a PDF or image — it validates type and size, then flips to a file card with preview and a clear button.
        </p>
      </div>
    </section>
  );
}
