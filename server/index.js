require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');
const PROFILES_DIR = path.join(__dirname, 'profiles'); // For LibreOffice temp profiles

fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(OUTPUT_DIR);
fs.ensureDirSync(PROFILES_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.pdf', '.jpg', '.jpeg', '.png', '.webp'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) cb(null, true);
    else cb(new Error('Unsupported file type.'));
  }
});

const cleanup = async (paths) => {
  for (const p of paths) {
    if (p) await fs.remove(p).catch(console.error);
  }
};

// --- Native LibreOffice Conversion ---
const convertWithLibreOffice = async (inputPath, outputFormat) => {
  const outputDir = OUTPUT_DIR;
  const profileDir = path.join(PROFILES_DIR, uuidv4());
  
  // Let LibreOffice choose the best filter automatically for most conversions
  // For PDF to Office, we try to force the writer_pdf_import filter
  let filter = outputFormat; 
  let inFilter = '';
  if (path.extname(inputPath).toLowerCase() === '.pdf' && (outputFormat === 'docx' || outputFormat === 'xlsx')) {
    inFilter = '--infilter="writer_pdf_import"';
  }

  // Command: soffice --headless -env:UserInstallation=file://[profile] [inFilter] --convert-to [format] --outdir [dir] [input]
  const cmd = `soffice --headless "-env:UserInstallation=file://${profileDir}" ${inFilter} --convert-to ${filter} --outdir "${outputDir}" "${inputPath}"`;
  
  try {
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout) console.log('LibreOffice stdout:', stdout);
    if (stderr) console.error('LibreOffice stderr:', stderr);

    const inputName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${inputName}.${outputFormat}`);
    
    // Check if file exists
    if (await fs.pathExists(outputPath)) {
      // Cleanup the profile dir
      fs.remove(profileDir).catch(console.error);
      return outputPath;
    } else {
      fs.remove(profileDir).catch(console.error);
      throw new Error(`Output file not created. LibreOffice output: ${stdout} ${stderr}`);
    }
  } catch (err) {
    fs.remove(profileDir).catch(console.error);
    console.error('LibreOffice execution error:', err);
    throw err;
  }
};

// --- Handlers ---

const handleOfficeConversion = async (req, res, format) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  
  const inputPath = file.path;

  try {
    const outputPath = await convertWithLibreOffice(inputPath, format);
    res.download(outputPath, () => cleanup([inputPath, outputPath]));
  } catch (err) {
    console.error('Conversion handler error:', err);
    cleanup([inputPath]);
    res.status(500).json({ error: 'Conversion failed. Make sure LibreOffice is correctly installed.' });
  }
};

// --- Routes ---

app.post('/api/convert/word-to-pdf', upload.any(), (req, res) => handleOfficeConversion(req, res, 'pdf'));
app.post('/api/convert/excel-to-pdf', upload.any(), (req, res) => handleOfficeConversion(req, res, 'pdf'));
app.post('/api/convert/ppt-to-pdf', upload.any(), (req, res) => handleOfficeConversion(req, res, 'pdf'));
app.post('/api/convert/pdf-to-word', upload.any(), (req, res) => handleOfficeConversion(req, res, 'docx'));
app.post('/api/convert/pdf-to-excel', upload.any(), (req, res) => handleOfficeConversion(req, res, 'xlsx'));

app.post('/api/convert/compress-image', upload.any(), async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const inputPath = file.path;
  const outputPath = path.join(OUTPUT_DIR, `compressed-${uuidv4()}${path.extname(file.originalname)}`);

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    let transform = sharp(inputPath).rotate();
    if (ext === '.jpg' || ext === '.jpeg') transform = transform.jpeg({ quality: 60 });
    else if (ext === '.png') transform = transform.png({ quality: 60, compressionLevel: 8 });
    else if (ext === '.webp') transform = transform.webp({ quality: 60 });
    
    await transform.toFile(outputPath);
    res.download(outputPath, () => cleanup([inputPath, outputPath]));
  } catch (err) {
    console.error(err);
    cleanup([inputPath]);
    res.status(500).json({ error: 'Compression failed' });
  }
});

app.post('/api/convert/merge-pdf', upload.any(), async (req, res) => {
  if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required' });
  const inputPaths = req.files.map(f => f.path);
  const outputPath = path.join(OUTPUT_DIR, `merged-${uuidv4()}.pdf`);

  try {
    const mergedPdf = await PDFDocument.create();
    for (const p of inputPaths) {
      const pdfBytes = await fs.readFile(p);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    const mergedPdfBytes = await mergedPdf.save();
    await fs.writeFile(outputPath, mergedPdfBytes);
    res.download(outputPath, () => cleanup([...inputPaths, outputPath]));
  } catch (err) {
    console.error(err);
    cleanup(inputPaths);
    res.status(500).json({ error: 'Merge failed' });
  }
});

app.post('/api/convert/qr-generator', upload.none(), async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const outputPath = path.join(OUTPUT_DIR, `qr-${uuidv4()}.png`);

  try {
    await QRCode.toFile(outputPath, text);
    res.download(outputPath, () => cleanup([outputPath]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

app.post('/api/convert/bg-remover', upload.any(), async (req, res) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const inputPath = file.path;
  const outputPath = path.join(OUTPUT_DIR, `no-bg-${uuidv4()}.png`);

  try {
    // Switching back to Python as it was verified to work in the terminal
    const cmd = `python3 "${path.join(__dirname, 'remove_bg.py')}" "${inputPath}" "${outputPath}"`;
    const { stdout, stderr } = await execPromise(cmd);
    
    if (await fs.pathExists(outputPath)) {
      res.download(outputPath, () => cleanup([inputPath, outputPath]));
    } else {
      console.error('Python Output:', stdout);
      console.error('Python Error:', stderr);
      throw new Error(stdout.includes('Error:') ? stdout.split('Error:')[1].trim() : 'AI failed to generate output');
    }
  } catch (err) {
    console.error('Background Remover Error:', err);
    cleanup([inputPath]);
    res.status(500).json({ error: err.message || 'Background removal failed' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
