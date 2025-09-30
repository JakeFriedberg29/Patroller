import * as Sentry from '@sentry/react';

export type MutateOpts<T> = {
  op: () => Promise<T>;
  refetch?: () => Promise<any>;
  tags?: Record<string, string | undefined>;
  name?: string;
  retry?: {
    enabled: boolean;
    maxRetries?: number;
  };
};

const inflight = new Set<string>();

export async function safeMutation<T>(key: string, opts: MutateOpts<T>): Promise<boolean> {
  if (inflight.has(key)) return false;
  inflight.add(key);
  try {
    const max = opts.retry?.enabled ? (opts.retry.maxRetries ?? 2) : 0;
    let attempt = 0;
    while (true) {
      try {
        await opts.op();
        return true;
      } catch (error: any) {
        const code = error?.code || error?.details || '';
        const isTransient = typeof code === 'string' && (code.startsWith('08') || code === '40001' || code.includes('timeout'));
        if (!(opts.retry?.enabled && isTransient) || attempt >= max) {
          try {
            Sentry.captureException(error, {
              tags: {
                op: opts.name || key,
                ...opts.tags,
              },
            });
          } catch {}
          return false;
        }
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
        attempt += 1;
      }
    }
  } finally {
    if (opts.refetch) await opts.refetch();
    inflight.delete(key);
  }
}


