import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const AI_SYSTEM_INSTRUCTION = `You are a document organization and editing assistant. Process only the user's supplied input; never use or infer information from any other document content.

First classify the input as exactly one of: structured, unstructured, or mixed. Do not reveal reasoning.

For structured input, preserve existing headings, paragraph order, bullet lists, numbered lists, names, dates, numbers, terminology, and facts. Apply only light grammar or formatting cleanup. Do not add sections unless required to preserve a clearly distinct unstructured portion.

For unstructured input, organize related information into concise semantic sections. Create headings only where useful. Use paragraphs for explanation, bullet lists for responsibilities, decisions, criteria, or unordered items, and numbered lists only when order or sequence matters.

For mixed input, preserve the structured portions and organize only the unstructured portions. Do not flatten the input into a summary.

Never invent, omit, or change names, dates, deadlines, numbers, organizations, decisions, responsibilities, events, or other facts. Avoid unnecessary expansion, headings, and generic filler. Never include section numbers in headings.

Return only JSON matching the response schema. Each block must include type, text, and items. For a paragraph, set items to []. For bulletList and numberedList, set text to "" and put all entries in items.`;

const aiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    inputType: {
      type: Type.STRING,
      enum: ['structured', 'unstructured', 'mixed']
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ['paragraph', 'bulletList', 'numberedList']
                },
                text: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['type', 'text', 'items']
            }
          }
        },
        required: ['heading', 'blocks']
      }
    }
  },
  required: ['inputType', 'sections']
};

const validInputTypes = new Set(['structured', 'unstructured', 'mixed']);
const validBlockTypes = new Set(['paragraph', 'bulletList', 'numberedList']);

const isValidAiResponse = (result) => (
  result &&
  validInputTypes.has(result.inputType) &&
  Array.isArray(result.sections) &&
  result.sections.length > 0 &&
  result.sections.every((section) => (
    section &&
    typeof section.heading === 'string' &&
    section.heading.trim() &&
    Array.isArray(section.blocks) &&
    section.blocks.length > 0 &&
    section.blocks.every((block) => (
      block &&
      validBlockTypes.has(block.type) &&
      typeof block.text === 'string' &&
      Array.isArray(block.items) &&
      block.items.every((item) => typeof item === 'string' && item.trim()) &&
      (block.type === 'paragraph' ? block.text.trim() : block.items.length > 0)
    ))
  ))
);

// ================= API ENDPOINTS =================

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'TekQuora Doc Studio API Server',
    port: PORT,
    aiConfigured: Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY),
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

app.post('/api/ai/generate', async (req, res) => {
  const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
  if (!input) {
    return res.status(400).json({ success: false, message: 'Input is required.' });
  }
  if (input.length > 30000) {
    return res.status(400).json({ success: false, message: 'Input must be 30,000 characters or fewer.' });
  }

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI generation is not configured. Set AI_API_KEY on the server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = Array.from(new Set([
      process.env.AI_MODEL,
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ].filter(Boolean)));

    let response;
    let lastErr;
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: input,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: aiResponseSchema
          }
        });
        if (response) break;
      } catch (e) {
        lastErr = e;
        const msg = e.message || '';
        if (msg.includes('404') || msg.includes('503') || msg.includes('NOT_FOUND') || msg.includes('UNAVAILABLE') || msg.includes('no longer available')) {
          continue;
        }
        throw e;
      }
    }
    if (!response && lastErr) throw lastErr;

    const result = JSON.parse(response.text || '');

    if (!isValidAiResponse(result)) {
      return res.status(502).json({ success: false, message: 'AI returned an invalid document structure. Please try again.' });
    }

    res.json({ success: true, inputType: result.inputType, sections: result.sections });
  } catch (err) {
    console.error('[AI Generate] Request failed:', err.message);
    res.status(502).json({ success: false, message: 'AI generation failed. Please try again.' });
  }
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
  console.log(`🤖 AI Configured: ${Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY)}`);
  console.log(`=================================================`);
});
