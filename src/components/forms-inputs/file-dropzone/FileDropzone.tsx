// ui-105 — FileDropzone
import { useCallback, useEffect, useRef, useState } from 'react';

type Category = 'pdf' | 'image' | 'video' | 'unknown';

export interface DroppedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: Category;
  preview?: string;
}

export interface FileDropzoneProps {
  onFileSelected?: (file: DroppedFile) => void;
  onClear?: () => void;
  /** Max file size in bytes. Default 500 MB. */
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

const ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
};
const ACCEPT_STRING = Object.entries(ACCEPT).flatMap(([mime, exts]) => [mime, ...exts]).join(',');

const categorize = (type: string): Category => {
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'unknown';
};
const formatBytes = (b: number) => {
  if (b === 0) return '0 B';
  const k = 1024;
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${u[i]}`;
};
const uid = () => Math.random().toString(36).slice(2, 10);

const Icon = ({ path }: { path: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  pdf: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  image: 'M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6',
  video: 'M23 7l-7 5 7 5zM1 5h15v14H1z',
  x: 'M18 6 6 18M6 6l12 12',
};

/**
 * Drag-and-drop file dropzone. Validates type + size, shows a hover state on
 * dragover, and swaps to a file card (image preview or category glyph, name,
 * size, badge) once a file lands. Click-to-browse and clear are wired in.
 */
export function FileDropzone({ onFileSelected, onClear, maxSize = 500 * 1024 * 1024, disabled, className = '' }: FileDropzoneProps) {
  const [current, setCurrent] = useState<DroppedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (current?.preview) URL.revokeObjectURL(current.preview);
  }, [current]);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const category = categorize(file.type);
      if (category === 'unknown') return setError('Unsupported type. Drop a PDF, JPEG, PNG, or MP4.');
      if (file.size > maxSize) return setError(`File exceeds ${formatBytes(maxSize)} limit.`);
      const preview = category === 'image' ? URL.createObjectURL(file) : undefined;
      const dropped: DroppedFile = { id: uid(), file, name: file.name, size: file.size, type: file.type, category, preview };
      setCurrent(dropped);
      onFileSelected?.(dropped);
    },
    [maxSize, onFileSelected],
  );

  const clear = () => {
    if (current?.preview) URL.revokeObjectURL(current.preview);
    setCurrent(null);
    setError(null);
    onClear?.();
  };

  if (current) {
    return (
      <div className={`relative flex h-64 flex-col items-center justify-center border border-ink bg-ink/[0.03] p-6 ${className}`}>
        <button type="button" onClick={clear} aria-label="Clear file" className="absolute right-3 top-3 cursor-pointer text-ink/60 hover:text-vermilion">
          <Icon path={ICONS.x} />
        </button>
        {current.preview ? (
          <img src={current.preview} alt="Preview" className="mb-4 h-20 w-20 border border-ink object-cover" />
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center bg-vermilion/15 text-vermilion">
            <Icon path={ICONS[current.category === 'unknown' ? 'upload' : current.category]} />
          </div>
        )}
        <p className="max-w-full truncate px-2 text-center font-mono text-xs">{current.name}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">{current.category}</span>
          <span className="font-mono text-[10px] text-ink/50">{formatBytes(current.size)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex h-64 cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors duration-300 ${
        dragOver ? 'border-vermilion bg-vermilion/10' : 'border-ink/40 hover:border-ink hover:bg-ink/[0.03]'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${className}`}
    >
      <input ref={inputRef} type="file" accept={ACCEPT_STRING} onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
        if (inputRef.current) inputRef.current.value = '';
      }} className="hidden" />
      <div className={`mb-4 flex h-12 w-12 items-center justify-center transition-colors ${dragOver ? 'bg-vermilion/20 text-vermilion' : 'bg-ink/5 text-ink/50'}`}>
        <Icon path={ICONS.upload} />
      </div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide">
        Drop a file or <span className="text-vermilion">browse</span>
      </p>
      <p className="font-mono text-[10px] text-ink/45">PDF, JPEG, PNG, MP4 — up to {formatBytes(maxSize)}</p>
      {error && <p className="mt-3 text-center font-mono text-[10px] text-vermilion">{error}</p>}
    </div>
  );
}
