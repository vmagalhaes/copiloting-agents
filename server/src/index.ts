import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import router from './router.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use('/api', router);

// Serve built client in production
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  const reset = '\x1b[0m';
  const bold  = '\x1b[1m';
  const cyan  = '\x1b[36m';
  const white = '\x1b[97m';
  const gray  = '\x1b[90m';

  // Width is the number of visible characters between the box borders
  const W = 46;

  const border = (l: string, r: string) =>
    `${gray}${l}${'─'.repeat(W)}${r}${reset}`;

  // A row where `text` is the visible content (no ANSI), `styled` is the styled version
  const row = (visibleText: string, styledText: string) => {
    const pad = W - 2 - visibleText.length; // 2 for the leading space + trailing space
    return `${gray}│${reset} ${styledText}${' '.repeat(Math.max(0, pad))} ${gray}│${reset}`;
  };

  const blank = `${gray}│${reset}${' '.repeat(W)}${gray}│${reset}`;

  const url        = `http://localhost:${PORT}`;
  const urlVisible = `Local:  ${url}`;
  const urlStyled  = `${gray}Local:${reset}  ${cyan}${bold}${url}${reset}`;

  const title        = '◆  Copiloting Agents';
  const titlePad     = Math.floor((W - title.length) / 2);
  const titleStyled  = `${' '.repeat(titlePad)}${bold}${white}${title}${reset}`;
  const titleVisible = ' '.repeat(titlePad) + title;

  const tagline        = '🍳  Cooking agents...';
  const taglinePad     = Math.floor((W - tagline.length) / 2);
  const taglineStyled  = `${' '.repeat(taglinePad)}${gray}${tagline}${reset}`;
  const taglineVisible = ' '.repeat(taglinePad) + tagline;

  console.log('');
  console.log(border('┌', '┐'));
  console.log(blank);
  console.log(row(titleVisible, titleStyled));
  console.log(row(taglineVisible, taglineStyled));
  console.log(blank);
  console.log(border('├', '┤'));
  console.log(blank);
  console.log(row(urlVisible, urlStyled));
  console.log(blank);
  console.log(border('└', '┘'));
  console.log('');
});
