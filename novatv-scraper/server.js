const express = require('express');
const { chromium } = require('playwright');
const app = express();
app.use(express.json());

// CORS preflight and headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Single API Endpoint
app.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL requerida' });
  }

  let browser;
  try {
    // Launch headless Chromium
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    let m3u8Url = null;

    // Intercept network requests in real-time
    page.on('request', request => {
      const reqUrl = request.url();
      if (reqUrl.includes('.m3u8') && !m3u8Url) {
        m3u8Url = reqUrl;
      }
    });

    // 15 seconds overall timeout limit
    await Promise.race([
      page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);

    // Give asynchronous players a brief extra moment to spawn video tracks
    if (!m3u8Url) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (m3u8Url) {
      res.json({ success: true, m3u8: m3u8Url });
    } else {
      res.status(404).json({ success: false, error: 'No se encontró stream de video (.m3u8)' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", service: "NovaTv Scraper Engine" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NovaTv scraper activo en puerto ${PORT}`);
});
