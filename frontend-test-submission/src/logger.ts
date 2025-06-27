export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
}

const LOG_KEY = 'customLogs';

function getLogs(): LogEntry[] {
  const logs = localStorage.getItem(LOG_KEY);
  return logs ? JSON.parse(logs) : [];
}

function saveLogs(logs: LogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function log(level: LogLevel, message: string, meta?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  };
  const logs = getLogs();
  logs.push(entry);
  saveLogs(logs);
}

export function getAllLogs(): LogEntry[] {
  return getLogs();
}

export function clearLogs() {
  saveLogs([]);
} 