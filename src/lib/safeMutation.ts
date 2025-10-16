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
  timeout?: number; // milliseconds, default 30000
  signal?: AbortSignal; // external abort signal
};

const inflight = new Map<string, { timestamp: number; controller: AbortController }>();

// Cleanup stale inflight operations (>5 minutes old)
setInterval(() => {
  const now = Date.now();
  for (const [key, { timestamp }] of inflight.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      inflight.delete(key);
    }
  }
}, 60 * 1000); // Check every minute

export async function safeMutation<T>(key: string, opts: MutateOpts<T>): Promise<boolean> {
  // Check if already running
  if (inflight.has(key)) {
    const existing = inflight.get(key);
    // If operation too old, abort it and start fresh
    if (existing && Date.now() - existing.timestamp > 30000) {
      existing.controller.abort();
      inflight.delete(key);
    } else {
      return false;
    }
  }

  const controller = new AbortController();
  const timeout = opts.timeout ?? 30000;
  inflight.set(key, { timestamp: Date.now(), controller });

  let success = false;
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    const max = opts.retry?.enabled ? (opts.retry.maxRetries ?? 2) : 0;
    let attempt = 0;

    while (true) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Operation timeout')), timeout);
        });

        // Race operation against timeout
        await Promise.race([
          opts.op(),
          timeoutPromise,
        ]);

        if (timeoutId) clearTimeout(timeoutId);
        success = true;
        return true;
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);

        // Check if aborted
        if (controller.signal.aborted || opts.signal?.aborted) {
          return false;
        }

        const code = error?.code || error?.details || '';
        const message = error?.message || '';
        
        // Categorize errors
        const isTimeout = message.includes('timeout') || message.includes('ETIMEDOUT');
        const isNetwork = code.startsWith('08') || message.includes('network') || message.includes('ECONNREFUSED');
        const isTransient = isTimeout || isNetwork || code === '40001';

        if (!(opts.retry?.enabled && isTransient) || attempt >= max) {
          try {
            Sentry.captureException(error, {
              tags: {
                op: opts.name || key,
                attempt: attempt.toString(),
                error_type: isTimeout ? 'timeout' : isNetwork ? 'network' : 'other',
                ...opts.tags,
              },
            });
          } catch {}
          return false;
        }

        // Exponential backoff with jitter
        const baseDelay = 300 * Math.pow(2, attempt);
        const jitter = Math.random() * 100;
        await new Promise(r => setTimeout(r, baseDelay + jitter));
        attempt += 1;
      }
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    
    // Only refetch on success
    if (success && opts.refetch) {
      try {
        await opts.refetch();
      } catch (e) {
        console.error('Refetch failed:', e);
      }
    }
    
    inflight.delete(key);
  }
}


