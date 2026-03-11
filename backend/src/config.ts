import * as fs from 'fs';
import * as path from 'path';

interface AppConfig {
  repositories: string[];
}

function loadConfig(): AppConfig {
  const configPath = path.join(__dirname, '..', 'repositories.config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as AppConfig;
  }
  return { repositories: [] };
}

export const appConfig = loadConfig();
