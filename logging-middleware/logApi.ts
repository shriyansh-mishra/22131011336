const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';

const allowedStacks = ['frontend', 'backend'];
const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
const allowedPackages = [
  // Frontend only
  'api', 'component', 'hook', 'page', 'state', 'style',
];

export async function logApi(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  if (!allowedStacks.includes(stack)) throw new Error('Invalid stack');
  if (!allowedLevels.includes(level)) throw new Error('Invalid level');
  if (!allowedPackages.includes(pkg)) throw new Error('Invalid package');

  const body = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const res = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer'
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // Optionally handle/log error
      throw new Error('Failed to log to remote server');
    }
    // Optionally handle/log success
  } catch (err) {
    // Optionally handle/log error
    // (Do not throw to avoid breaking app flow)
  }
} 