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
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaHJpeWFuc2guMjJzY3NlMTAxMTM0NEBnYWxnb3RpYXN1bml2ZXJzaXR5LmVkdS5pbiIsImV4cCI6MTc1MTAxMzk0MCwiaWF0IjoxNzUxMDEzMDQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmI3MzVjN2EtOTYzZi00YjlhLWFmZTktYTlmN2MxNjAxYzI3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2hyaXlhbnNoIG1pc2hyYSIsInN1YiI6ImI2ZDk4M2ZmLTZkZWYtNDU1Ni1iODUzLTQ0NjYwNGJlYWFlOCJ9LCJlbWFpbCI6InNocml5YW5zaC4yMnNjc2UxMDExMzQ0QGdhbGdvdGlhc3VuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6InNocml5YW5zaCBtaXNocmEiLCJyb2xsTm8iOiIyMnNjc2UxMDExMzQ0IiwiYWNjZXNzQ29kZSI6Ik11YWd2cSIsImNsaWVudElEIjoiYjZkOTgzZmYtNmRlZi00NTU2LWI4NTMtNDQ2NjA0YmVhYWU4IiwiY2xpZW50U2VjcmV0IjoiZWFXUnJYbWdYQ3NiSENtUSJ9.vseAu_DPP9u1La2Z-YhjZZ-s4KmAGWm9skefhY9ydg4'
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