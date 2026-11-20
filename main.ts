import { createApp } from './app.ts';

const rawEnvOrigin = process.env.MAKEFUN_ENV_URL?.trim() ?? '';
if (!rawEnvOrigin) {
  process.stderr.write('MAKEFUN_ENV_URL is required to register this forge.\n');
  process.exit(1);
}
const envOrigin = rawEnvOrigin.replace(/\/+$/, '');
const callLimitMs = 30_000;
const minPauseMs = 250;
const maxPauseMs = 2_000;

function pause(attempt: number): Promise<void> {
  const delay = Math.min(maxPauseMs, minPauseMs * 2 ** Math.min(attempt, 8));
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function announce(port: number): Promise<void> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(`${envOrigin}/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ port }),
        signal: AbortSignal.timeout(callLimitMs),
      });
      // A different process may have registered first; the environment still owns this trial.
      if (response.status === 200 || response.status === 409) return;
      if (response.status === 400 || response.status === 405) {
        throw new Error(`registration rejected with HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (cause) {
      if (cause instanceof Error && cause.message.startsWith('registration rejected')) throw cause;
      // Transient connection and timeout failures are retried below.
    }
    await pause(attempt++);
  }
}

async function waitUntilFinished(): Promise<void> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(`${envOrigin}/done`, {
        signal: AbortSignal.timeout(callLimitMs),
      });
      if (response.ok) {
        const state = (await response.json()) as { done?: unknown };
        if (state.done === true) return;
      }
    } catch {
      // Keep the forge alive if the environment is starting, busy, or temporarily unreachable.
    }
    await pause(attempt++);
  }
}

async function runEntry(): Promise<void> {
  const server = createApp();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, resolve);
  });

  const bound = server.address();
  if (!bound || typeof bound === 'string') throw new Error('Could not determine the forge TCP port.');
  process.stdout.write(`Forge is listening on port ${bound.port}.\n`);

  await announce(bound.port);
  await waitUntilFinished();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

try {
  await runEntry();
  process.exit(0);
} catch (cause) {
  process.stderr.write(`Forge lifecycle failed: ${cause instanceof Error ? cause.message : String(cause)}\n`);
  process.exit(1);
}
