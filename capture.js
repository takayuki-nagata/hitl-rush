import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4173;
const DIST_DIR = path.join(__dirname, 'dist');
const SCREENSHOT_DIR = path.join(__dirname, 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Simple static HTTP server for dist/
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Start Screen
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'start_screen.png') });
    console.log('Saved start_screen.png');

    // 2. Playing Screen
    await page.click('.btn-start-game');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'playing_screen.png') });
    console.log('Saved playing_screen.png');

    // 3. Game Over Screen (trigger destructive click or click Yes multiple times)
    for (let i = 0; i < 15; i++) {
      const modal = await page.$('.disaster-modal');
      if (modal) break;
      const yesBtn = await page.$('.btn-yes');
      if (yesBtn) {
        await yesBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }
    }
    
    // Ensure modal appears
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'game_over_screen.png') });
    console.log('Saved game_over_screen.png');

    await browser.close();
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
