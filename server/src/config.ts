import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_PATH = path.join(os.homedir(), '.copiloting-agents.json');

interface PersistedConfig {
  sessionDir?: string;
}

export function loadConfig(): PersistedConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw) as PersistedConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: PersistedConfig): void {
  try {
    const existing = loadConfig();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...config }, null, 2));
  } catch {
    // best-effort
  }
}
