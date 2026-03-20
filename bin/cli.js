#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverEntry = join(__dirname, '../server/dist/index.js');

if (!existsSync(serverEntry)) {
  console.error('Server build not found. Run: npm run build');
  process.exit(1);
}

// Delegate to the compiled server
await import(serverEntry);
