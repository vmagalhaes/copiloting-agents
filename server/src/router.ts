import { Router } from 'express';
import fs from 'fs';
import { listAllSessions, parseSessionDir, SESSIONS_BASE, setSessionsBase } from './sessionReader.js';
import { saveConfig } from './config.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.get('/config', (_req, res) => {
  res.json({
    sessionDir: SESSIONS_BASE,
    exists: fs.existsSync(SESSIONS_BASE),
  });
});

router.post('/config/session-dir', (req, res) => {
  const { dir } = req.body as { dir?: string };
  if (!dir || typeof dir !== 'string') {
    res.status(400).json({ error: 'dir is required' });
    return;
  }
  if (!fs.existsSync(dir)) {
    res.status(400).json({ error: 'Directory not found' });
    return;
  }
  setSessionsBase(dir);
  saveConfig({ sessionDir: dir });
  res.json({ ok: true, sessionDir: dir });
});

router.get('/sessions', (_req, res) => {
  const sessions = listAllSessions();
  res.json({ sessions });
});

router.get('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const detail = parseSessionDir(sessionId);
  if (!detail) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(detail);
});

export default router;
