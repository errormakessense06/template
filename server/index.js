import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure data and uploads directories exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'documents.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Helper to read DB
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return { documents: [] };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { documents: [] };
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// ================= API ENDPOINTS =================

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'TekQuora Doc Studio API Server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 2. GET all documents
app.get('/api/documents', (req, res) => {
  const db = readDB();
  res.json({ success: true, count: db.documents.length, documents: db.documents });
});

// 3. GET document by ID
app.get('/api/documents/:id', (req, res) => {
  const db = readDB();
  const doc = db.documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }
  res.json({ success: true, document: doc });
});

// 4. POST create or update document
app.post('/api/documents', (req, res) => {
  const document = req.body;
  if (!document || !document.id) {
    return res.status(400).json({ success: false, message: 'Document payload must include an id' });
  }

  const db = readDB();
  const index = db.documents.findIndex((d) => d.id === document.id);

  if (index >= 0) {
    db.documents[index] = { ...document, updatedAt: new Date().toISOString() };
  } else {
    db.documents.push({ ...document, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  writeDB(db);
  res.json({ success: true, message: 'Document saved successfully', document });
});

// 5. DELETE document by ID
app.delete('/api/documents/:id', (req, res) => {
  const db = readDB();
  const filtered = db.documents.filter((d) => d.id !== req.params.id);

  if (filtered.length === db.documents.length) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  writeDB({ documents: filtered });
  res.json({ success: true, message: 'Document deleted successfully' });
});

// 6. POST file upload (Flexible middleware accepting any file field)
app.post('/api/upload', (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(500).json({ success: false, message: 'File upload error', error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const uploadedFile = req.files[0];
    const fileUrl = `http://localhost:${PORT}/uploads/${uploadedFile.filename}`;
    res.json({
      success: true,
      file: {
        name: uploadedFile.originalname,
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        url: fileUrl
      }
    });
  });
});

// 7. POST Puppeteer-based server-side PDF export
app.post('/api/export-pdf', async (req, res) => {
  let browser;
  try {
    const { html, filename } = req.body;
    if (!html) return res.status(400).json({ error: 'Missing html in request body' });

    console.log('[PDF Export] Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Allow images, stylesheets, fonts, documents, local/data/about URIs so
    // external fonts (e.g. Inter from Google Fonts) and images load in PDF.
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const type = request.resourceType();
      if (
        request.isNavigationRequest() ||
        type === 'image' ||
        type === 'stylesheet' ||
        type === 'font' ||
        type === 'document' ||
        url.startsWith('data:') ||
        url.startsWith('about:') ||
        url.startsWith('blob:') ||
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.0.0.1')
      ) {
        request.continue();
      } else {
        request.abort();
      }
    });

    // Use domcontentloaded — safe once HTML is parsed.
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.emulateMediaType('print');

    // Wait for web fonts (Inter, etc.) & <img> tags to complete loading/decoding
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.race([
        Promise.all(
          imgs.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        ),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
    });

    console.log('[PDF Export] Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
    });

    console.log(`[PDF Export] Done. Size: ${pdfBuffer.length} bytes`);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename || 'document.pdf'}"`
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('[PDF Export] Failed:', err.message);
    res.status(500).json({ error: 'PDF generation failed', details: err.message });
  } finally {
    // Always close browser even if pdf() or setContent() throws
    if (browser) await browser.close().catch(() => {});
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 TekQuora Backend API Server running on port ${PORT}`);
  console.log(`=================================================`);
});
