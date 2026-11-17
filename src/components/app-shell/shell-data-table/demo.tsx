// DataTable — sort a column and the 50ms ladder replays; resize and it becomes cards
import { useMemo, useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { DataTable, type DataTableColumn } from './DataTable';

interface Deployment {
  id: string;
  service: string;
  region: string;
  status: 'healthy' | 'degraded' | 'failed';
  p99: number;
  requests: number;
  shipped: string;
}

const ROWS: Deployment[] = [
  { id: 'd1', service: 'ingest-gateway', region: 'ap-south-1', status: 'healthy', p99: 38, requests: 1_204_882, shipped: '2026-09-08' },
  { id: 'd2', service: 'stream-router', region: 'eu-west-2', status: 'healthy', p99: 44, requests: 884_102, shipped: '2026-09-08' },
  { id: 'd3', service: 'query-planner', region: 'us-east-1', status: 'degraded', p99: 128, requests: 2_441_009, shipped: '2026-09-07' },
  { id: 'd4', service: 'blob-compactor', region: 'ap-south-1', status: 'healthy', p99: 61, requests: 312_774, shipped: '2026-09-07' },
  { id: 'd5', service: 'auth-edge', region: 'us-west-2', status: 'healthy', p99: 22, requests: 3_918_220, shipped: '2026-09-06' },
  { id: 'd6', service: 'billing-worker', region: 'eu-central-1', status: 'failed', p99: 402, requests: 18_442, shipped: '2026-09-06' },
  { id: 'd7', service: 'search-indexer', region: 'ap-southeast-1', status: 'healthy', p99: 74, requests: 641_330, shipped: '2026-09-05' },
  { id: 'd8', service: 'webhook-fanout', region: 'us-east-1', status: 'degraded', p99: 96, requests: 1_002_884, shipped: '2026-09-05' },
  { id: 'd9', service: 'metrics-rollup', region: 'eu-west-2', status: 'healthy', p99: 51, requests: 774_112, shipped: '2026-09-04' },
  { id: 'd10', service: 'cdn-purge', region: 'global', status: 'healthy', p99: 12, requests: 88_401, shipped: '2026-09-04' },
  { id: 'd11', service: 'schema-registry', region: 'us-east-1', status: 'healthy', p99: 29, requests: 204_118, shipped: '2026-09-03' },
  { id: 'd12', service: 'replay-buffer', region: 'ap-south-1', status: 'degraded', p99: 143, requests: 55_902, shipped: '2026-09-03' },
];

const STATUS: Record<Deployment['status'], string> = {
  healthy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  degraded: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const nf = new Intl.NumberFormat('en-US');

export default function ShellDataTableDemo() {
  const [narrow, setNarrow] = useState(false);
  const [picked, setPicked] = useState<Deployment | null>(null);

  const columns = useMemo<DataTableColumn<Deployment>[]>(
    () => [
      {
        key: 'service',
        header: 'Service',
        sortValue: (r) => r.service,
        render: (r) => (
          <span className="font-medium text-gray-900 dark:text-white">{r.service}</span>
        ),
      },
      {
        key: 'region',
        header: 'Region',
        secondary: true,
        sortValue: (r) => r.region,
        render: (r) => <span className="font-mono text-[12.5px]">{r.region}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        sortValue: (r) => r.status,
        render: (r) => (
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-[999px] px-2.5 py-1 text-[11.5px] font-medium capitalize ' +
              STATUS[r.status]
            }
          >
            <span className="h-1.5 w-1.5 rounded-[999px] bg-current" />
            {r.status}
          </span>
        ),
      },
      {
        key: 'p99',
        header: 'p99',
        align: 'right',
        sortValue: (r) => r.p99,
        render: (r) => <span className="tnum">{r.p99}ms</span>,
      },
      {
        key: 'requests',
        header: 'Requests',
        align: 'right',
        secondary: true,
        sortValue: (r) => r.requests,
        render: (r) => <span className="tnum">{nf.format(r.requests)}</span>,
      },
      {
        key: 'shipped',
        header: 'Shipped',
        align: 'right',
        secondary: true,
        sortValue: (r) => r.shipped,
        render: (r) => <span className="tnum text-gray-400 dark:text-gray-500">{r.shipped}</span>,
      },
    ],
    [],
  );

  return (
    <ShellStage hint="Sort any column: the cascade replays because the visible order changed. Re-render for any other reason and the rows stay put.">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
              Data
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">DataTable</h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
              The entrance is a plain keyframe with a computed{' '}
              <code className="font-mono text-[13.5px]">animation-delay</code>. Tailwind's{' '}
              <code className="font-mono text-[13.5px]">delay-*</code> utilities set{' '}
              <code className="font-mono text-[13.5px]">transition-delay</code>, which does nothing
              to an animation — and a per-row value could not be a class anyway.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNarrow((n) => !n)}
            aria-pressed={narrow}
            className="inline-flex h-9 shrink-0 items-center rounded-[999px] border border-gray-200 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:text-gray-900 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
          >
            {narrow ? 'Wide container' : 'Narrow container'}
          </button>
        </header>

        {/* The container is what decides the layout, not the viewport — squeeze
            it and the same rows become cards on the same screen. */}
        <div className={narrow ? 'max-w-sm' : 'max-w-none'}>
          <DataTable
            rows={ROWS}
            columns={columns}
            getRowId={(r) => r.id}
            caption="Recent deployments by service"
            onRowActivate={setPicked}
            initialSort={{ key: 'p99', direction: 'desc' }}
          />
        </div>

        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Last activated:{' '}
          <span className="font-medium">{picked ? picked.service : 'nothing yet'}</span> — rows are
          keyboard-activatable with Enter or Space when{' '}
          <code className="font-mono text-[12px]">onRowActivate</code> is supplied.
        </p>
      </div>
    </ShellStage>
  );
}
