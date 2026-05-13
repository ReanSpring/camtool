import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileUp, FileCheck, Loader2, Download, X, AlertCircle, Clock,
  Image as ImageIcon, FileType, FileSpreadsheet, Combine, QrCode, Eraser,
  Table, Presentation, ChevronUp, ChevronDown, Settings, Upload, Paintbrush, 
  Trash2, Undo, Palette, Image as LucideImage, RotateCw, History
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getToolConfig = (activeTool, language) => {
  const isEn = language === 'en';
  
  const configs = {
    'word-to-pdf': {
      title: isEn ? 'Word to PDF' : 'Word ទៅ PDF',
      description: isEn ? 'Convert your DOC and DOCX files to high-quality PDF documents in seconds.' : 'បំប្លែងឯកសារ DOC និង DOCX របស់អ្នកទៅជាឯកសារ PDF ដែលមានគុណភាពខ្ពស់ក្នុងរយៈពេលប៉ុន្មានវិនាទី។',
      accept: { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
      endpoint: '/api/convert/word-to-pdf',
      icon: <FileUp className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Convert to PDF' : 'បំប្លែងទៅជា PDF',
      successText: isEn ? 'Conversion Successful!' : 'ការបំប្លែងបានជោគជ័យ!',
      downloadExt: 'pdf'
    },
    'excel-to-pdf': {
      title: isEn ? 'Excel to PDF' : 'Excel ទៅ PDF',
      description: isEn ? 'Convert your XLS and XLSX spreadsheets to high-quality PDF documents.' : 'បំប្លែងតារាង XLS និង XLSX របស់អ្នកទៅជាឯកសារ PDF ដែលមានគុណភាពខ្ពស់។',
      accept: { 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
      endpoint: '/api/convert/excel-to-pdf',
      icon: <Table className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Convert to PDF' : 'បំប្លែងទៅជា PDF',
      successText: isEn ? 'Conversion Successful!' : 'ការបំប្លែងបានជោគជ័យ!',
      downloadExt: 'pdf'
    },
    'ppt-to-pdf': {
      title: isEn ? 'PowerPoint to PDF' : 'PPT ទៅ PDF',
      description: isEn ? 'Convert your PPT and PPTX presentations to high-quality PDF documents.' : 'បំប្លែងបទបង្ហាញ PPT និង PPTX របស់អ្នកទៅជាឯកសារ PDF ដែលមានគុណភាពខ្ពស់។',
      accept: { 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
      endpoint: '/api/convert/ppt-to-pdf',
      icon: <Presentation className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Convert to PDF' : 'បំប្លែងទៅជា PDF',
      successText: isEn ? 'Conversion Successful!' : 'ការបំប្លែងបានជោគជ័យ!',
      downloadExt: 'pdf'
    },
    'compress-image': {
      title: isEn ? 'Compress Image' : 'បង្រួមរូបភាព',
      description: isEn ? 'Reduce the file size of your JPG, PNG, and WebP images without losing quality.' : 'កាត់បន្ថយទំហំឯកសាររូបភាព JPG, PNG, និង WebP របស់អ្នកដោយមិនបាត់បង់គុណភាព។',
      accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
      endpoint: '/api/convert/compress-image',
      icon: <ImageIcon className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Compress Image' : 'បង្រួមរូបភាព',
      successText: isEn ? 'Compression Successful!' : 'ការបង្រួមបានជោគជ័យ!',
      downloadExt: null
    },
    'pdf-to-word': {
      title: isEn ? 'PDF to Word' : 'PDF ទៅ Word',
      description: isEn ? 'Convert your PDF documents to editable Word files (.docx).' : 'បំប្លែងឯកសារ PDF របស់អ្នកទៅជាឯកសារ Word (.docx) ដែលអាចកែសម្រួលបាន។',
      accept: { 'application/pdf': ['.pdf'] },
      endpoint: '/api/convert/pdf-to-word',
      icon: <FileType className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Convert to Word' : 'បំប្លែងទៅជា Word',
      successText: isEn ? 'Conversion Successful!' : 'ការបំប្លែងបានជោគជ័យ!',
      downloadExt: 'docx',
      isComingSoon: true
    },
    'pdf-to-excel': {
      title: isEn ? 'PDF to Excel' : 'PDF ទៅ Excel',
      description: isEn ? 'Convert your PDF documents to Excel spreadsheets (.xlsx).' : 'បំប្លែងឯកសារ PDF របស់អ្នកទៅជាតារាង Excel (.xlsx)។',
      accept: { 'application/pdf': ['.pdf'] },
      endpoint: '/api/convert/pdf-to-excel',
      icon: <FileSpreadsheet className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Convert to Excel' : 'បំប្លែងទៅជា Excel',
      successText: isEn ? 'Conversion Successful!' : 'ការបំប្លែងបានជោគជ័យ!',
      downloadExt: 'xlsx',
      isComingSoon: true
    },
    'merge-pdf': {
      title: isEn ? 'Merge PDF' : 'បញ្ចូល PDF',
      description: isEn ? 'Combine multiple PDF files into a single document.' : 'បញ្ចូលឯកសារ PDF ច្រើនទៅជាឯកសារតែមួយ។',
      accept: { 'application/pdf': ['.pdf'] },
      endpoint: '/api/convert/merge-pdf',
      icon: <Combine className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Merge PDFs' : 'បញ្ចូល PDF',
      successText: isEn ? 'Merge Successful!' : 'ការបញ្ចូលបានជោគជ័យ!',
      downloadExt: 'pdf',
      multiple: true
    },
    'qr-generator': {
      title: isEn ? 'QR Generator' : 'បង្កើត QR',
      description: isEn ? 'Generate a QR code for any text or URL.' : 'បង្កើតកូដ QR សម្រាប់អត្ថបទ ឬ URL ណាមួយ។',
      mode: 'qr',
      icon: <QrCode className="w-8 h-8 text-primary-600" />,
      successText: isEn ? 'QR Code Generated!' : 'បានបង្កើតកូដ QR!',
    },
    'bg-remover': {
      title: isEn ? 'BG Remover' : 'លុបផ្ទៃខាងក្រោយ',
      description: isEn ? 'Remove the background from your images automatically using AI.' : 'លុបផ្ទៃខាងក្រោយចេញពីរូបភាពរបស់អ្នកដោយស្វ័យប្រវត្តិដោយប្រើ AI។',
      accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
      endpoint: '/api/convert/bg-remover',
      icon: <Eraser className="w-8 h-8 text-primary-600" />,
      buttonText: isEn ? 'Remove Background' : 'លុបផ្ទៃខាងក្រោយ',
      successText: isEn ? 'Background Removed!' : 'បានលុបផ្ទៃខាងក្រោយ!',
      downloadExt: 'png',
      mode: 'bg-remover',
      isComingSoon: true
    }
  };
  return configs[activeTool];
};

const Converter = ({ activeTool, language }) => {
  const [files, setFiles] = useState([]);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [success, setSuccess] = useState(false);

  // QR Specific State
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLogo, setQrLogo] = useState(null);
  const [qrSize, setQrSize] = useState(300);
  const qrRef = useRef();

  // BG Remover Specific State
  const [originalImg, setOriginalImg] = useState(null);
  const [processedImg, setProcessedImg] = useState(null);
  const [bgColor, setBgColor] = useState('transparent');
  const [bgImage, setBgImage] = useState(null);
  const [editorMode, setEditorMode] = useState('erase'); // 'erase' or 'restore'
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const rotation = useRef(0);
  const [rotationState, setRotationState] = useState(0); // For UI sync
  const originalImgRef = useRef(null);
  const processedImgRef = useRef(null);
  const originalCorrectedRef = useRef(null); // Fixed orientation version of original
  const editorCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const isInitialized = useRef(false);

  const config = getToolConfig(activeTool, language);
  const isEn = language === 'en';

  useEffect(() => {
    reset();
  }, [activeTool]);

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      if (config.multiple) {
        setFiles(prev => [...prev, ...acceptedFiles]);
      } else {
        setFiles([acceptedFiles[0]]);
        if (config.mode === 'bg-remover') {
          const reader = new FileReader();
          reader.onload = async (e) => {
            setOriginalImg(e.target.result);
            try {
              originalImgRef.current = await loadImage(e.target.result);
            } catch (err) {
              console.error('Failed to load original image:', err);
            }
          };
          reader.readAsDataURL(acceptedFiles[0]);
        }
      }
      setError(null);
      setDownloadUrl(null);
      setSuccess(false);
    }
  }, [config.multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.accept,
    multiple: config.multiple || false,
    disabled: config.isComingSoon
  });

  const handleProcess = async () => {
    if (config.isComingSoon) return;
    if (config.mode === 'text' && !inputText) return;
    if (config.mode !== 'text' && files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${API_BASE_URL}${config.endpoint}`, formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      
      if (config.mode === 'bg-remover') {
        setProcessedImg(url);
        try {
          const img = await loadImage(url);
          processedImgRef.current = img;
          
          // Create a "Corrected" version of the original image that matches the AI result's aspect ratio
          if (originalImgRef.current) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(originalImgRef.current, 0, 0, img.width, img.height);
            originalCorrectedRef.current = await loadImage(tempCanvas.toDataURL());
          }

          setSuccess(true);
          setProcessing(false);
          isInitialized.current = false;
          setTimeout(() => initEditor(), 100);
        } catch (err) {
          console.error('Failed to load processed image:', err);
          setError(isEn ? 'Failed to load the AI result. Please try again.' : 'មិនអាចផ្ទុកលទ្ធផល AI បានទេ។ សូមព្យាយាមម្តងទៀត។');
          setProcessing(false);
        }
      } else {
        setDownloadUrl(url);
        setSuccess(true);
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.error;
      setError(serverError || (isEn ? 'An error occurred during processing. Please try again.' : 'មានកំហុសបានកើតឡើងកំឡុងពេលដំណើរការ។ សូមព្យាយាមម្តងទៀត។'));
      setProcessing(false);
    }
  };

  const initEditor = () => {
    const img = processedImgRef.current;
    if (!img || !editorCanvasRef.current || !maskCanvasRef.current) return;
    
    const maxWidth = 800;
    const maxHeight = 500;
    
    const isPortrait = rotation.current === 90 || rotation.current === 270;
    let width = isPortrait ? img.height : img.width;
    let height = isPortrait ? img.width : img.height;
    
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }
    
    width = Math.round(width);
    height = Math.round(height);
    
    const canvas = editorCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;
    
    renderEditor();
  };

  const handleRotate = () => {
    rotation.current = (rotation.current + 90) % 360;
    setRotationState(rotation.current);
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      const ctx = maskCanvas.getContext('2d');
      ctx.clearRect(0,0, maskCanvas.width, maskCanvas.height);
    }
    initEditor();
  };

  const handleRestoreFull = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    renderEditor();
  };

  const renderEditor = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Background
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (bgImage) {
      const bImg = new Image();
      bImg.src = bgImage;
      bImg.onload = () => {
        ctx.drawImage(bImg, 0, 0, canvas.width, canvas.height);
        drawForeground();
      };
      bImg.onerror = () => drawForeground();
    } else {
      drawForeground();
    }
  };

  const drawForeground = () => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !processedImgRef.current || !originalImgRef.current) return;
    const ctx = canvas.getContext('2d');
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');
    
    const width = canvas.width;
    const height = canvas.height;

    // Create temporary canvases for rotated source images
    const procTemp = document.createElement('canvas');
    procTemp.width = width;
    procTemp.height = height;
    const pCtx = procTemp.getContext('2d');
    
    const origTemp = document.createElement('canvas');
    origTemp.width = width;
    origTemp.height = height;
    const oCtx = origTemp.getContext('2d');

    const drawRotated = (tCtx, img) => {
      tCtx.save();
      tCtx.translate(width / 2, height / 2);
      tCtx.rotate((rotation.current * Math.PI) / 180);
      const isPortrait = rotation.current === 90 || rotation.current === 270;
      const drawW = isPortrait ? height : width;
      const drawH = isPortrait ? width : height;
      tCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      tCtx.restore();
    };

    drawRotated(pCtx, processedImgRef.current);
    drawRotated(oCtx, originalCorrectedRef.current || originalImgRef.current);

    // Use ImageData for precise masking
    const procData = pCtx.getImageData(0, 0, width, height);
    const origData = oCtx.getImageData(0, 0, width, height);
    const maskData = maskCtx.getImageData(0, 0, width, height);
    const finalData = ctx.getImageData(0, 0, width, height);

    for (let i = 0; i < maskData.data.length; i += 4) {
      const mr = maskData.data[i];
      const mb = maskData.data[i+2];
      const ma = maskData.data[i+3];

      let r = procData.data[i];
      let g = procData.data[i+1];
      let b = procData.data[i+2];
      let a = procData.data[i+3];

      if (ma > 0) {
        if (mr > 128) { // Erase Mode (Red)
          a = 0;
        } else if (mb > 128) { // Restore Mode (Blue)
          r = origData.data[i];
          g = origData.data[i+1];
          b = origData.data[i+2];
          a = origData.data[i+3];
        }
      }

      // Blend with existing background on canvas
      if (a === 255) {
        finalData.data[i] = r;
        finalData.data[i+1] = g;
        finalData.data[i+2] = b;
        finalData.data[i+3] = 255;
      } else if (a > 0) {
        const alpha = a / 255;
        finalData.data[i] = r * alpha + finalData.data[i] * (1 - alpha);
        finalData.data[i+1] = g * alpha + finalData.data[i+1] * (1 - alpha);
        finalData.data[i+2] = b * alpha + finalData.data[i+2] * (1 - alpha);
        finalData.data[i+3] = 255;
      }
      // if a == 0, keep background as is
    }

    ctx.putImageData(finalData, 0, 0);
  };

  const lastPos = useRef(null);

  const handleDraw = (e) => {
    if (!isDrawing || !maskCanvasRef.current || !editorCanvasRef.current) return;
    
    const canvas = editorCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize * 2;
    ctx.globalCompositeOperation = 'source-over';
    
    if (editorMode === 'erase') {
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
    } else {
      ctx.strokeStyle = 'blue';
      ctx.fillStyle = 'blue';
    }
    
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.fill();
    
    lastPos.current = { x, y };
    renderEditor();
  };

  const handleDownload = () => {
    if (config.mode === 'bg-remover') {
      const canvas = editorCanvasRef.current;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'camtools-bg-removed.png';
      link.click();
    } else {
      const link = document.createElement('a');
      link.href = downloadUrl;
      let fileName = 'camtools-result';
      if (files.length > 0) {
        const nameParts = files[0].name.split('.');
        const ext = config.downloadExt || nameParts.pop();
        fileName = `${nameParts.join('.')}-processed.${ext}`;
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleQrDownload = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'camtools-qr.png';
    link.click();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setQrLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBgImgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgImage(e.target.result);
        setTimeout(renderEditor, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;
    
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const reset = () => {
    setFiles([]);
    setInputText('');
    setDownloadUrl(null);
    setSuccess(false);
    setError(null);
    setProgress(0);
    setQrLogo(null);
    setOriginalImg(null);
    setProcessedImg(null);
    originalImgRef.current = null;
    processedImgRef.current = null;
    setBgImage(null);
    setBgColor('transparent');
    setEditorMode('erase');
    rotation.current = 0;
    setRotationState(0);
  };

  useEffect(() => {
    if (success && config.mode === 'bg-remover') {
      renderEditor();
    }
  }, [bgColor, bgImage]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <motion.div 
        key={activeTool + language}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`card p-8 md:p-12 text-center relative overflow-hidden ${config.mode === 'qr' || config.mode === 'bg-remover' ? 'max-w-5xl mx-auto' : 'max-w-3xl mx-auto'}`}
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{config.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{config.description}</p>

        {config.isComingSoon ? (
          <div className="py-20 flex flex-col items-center gap-6">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full">
              <Clock className="w-16 h-16 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {isEn ? 'Coming Soon' : 'នឹងមកដល់ឆាប់ៗនេះ'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isEn 
                  ? "We're currently optimizing this tool for better accuracy with complex scripts. Stay tuned!" 
                  : "យើងកំពុងបង្កើនប្រសិទ្ធភាពឧបករណ៍នេះសម្រាប់ភាពត្រឹមត្រូវកាន់តែប្រសើរឡើង។ សូមរង់ចាំ!"}
              </p>
            </div>
          </div>
        ) : config.mode === 'qr' ? (
          <div className="grid md:grid-cols-2 gap-12 items-start text-left">
            {/* QR Preview */}
            <div className="flex flex-col items-center gap-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-xl">
                <QRCodeCanvas 
                  value={inputText || 'https://camtools.app'}
                  size={qrSize}
                  fgColor={qrFgColor}
                  bgColor={qrBgColor}
                  level="H"
                  imageSettings={qrLogo ? {
                    src: qrLogo,
                    height: qrSize * 0.2,
                    width: qrSize * 0.2,
                    excavate: true,
                  } : undefined}
                />
              </div>
              <button onClick={handleQrDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                {isEn ? 'Download QR Code' : 'ទាញយកកូដ QR'}
              </button>
            </div>

            {/* QR Settings */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Text or URL' : 'អត្ថបទ ឬ URL'}
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isEn ? "Enter text or URL here..." : "បញ្ចូលអត្ថបទ ឬ URL នៅទីនេះ..."}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? 'QR Color' : 'ពណ៌កូដ QR'}
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <input 
                      type="color" 
                      value={qrFgColor} 
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono uppercase">{qrFgColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? 'Background' : 'ផ្ទៃខាងក្រោយ'}
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <input 
                      type="color" 
                      value={qrBgColor} 
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono uppercase">{qrBgColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Add Center Logo' : 'បន្ថែមឡូហ្គោ'}
                </label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden" 
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="flex items-center gap-3 w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer group-hover:border-primary-500 transition-all"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                    <span className="text-sm text-slate-500 group-hover:text-primary-600">
                      {qrLogo ? (isEn ? 'Change Logo' : 'ប្តូរឡូហ្គោ') : (isEn ? 'Upload Image' : 'ផ្ទុកឡើងរូបភាព')}
                    </span>
                  </label>
                  {qrLogo && (
                    <button 
                      onClick={() => setQrLogo(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : config.mode === 'bg-remover' && success ? (
          <div className="grid lg:grid-cols-[1fr,300px] gap-8 items-start text-left">
            {/* Editor Canvas Area */}
            <div className="flex flex-col items-center gap-4 bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div 
                className={`relative shadow-2xl rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] ${editorMode === 'erase' ? 'cursor-crosshair' : 'cursor-cell'}`}
                onMouseDown={(e) => {
                  setIsDrawing(true);
                  lastPos.current = null;
                  handleDraw(e);
                }}
                onMouseUp={() => {
                  setIsDrawing(false);
                  lastPos.current = null;
                }}
                onMouseMove={handleDraw}
                onMouseLeave={() => {
                  setIsDrawing(false);
                  lastPos.current = null;
                }}
              >
                <canvas ref={editorCanvasRef} className="relative z-10 block" />
                <canvas ref={maskCanvasRef} className="hidden" />
              </div>
              <div className="flex justify-between w-full text-xs text-slate-400 font-medium">
                <span>{editorMode === 'erase' ? (isEn ? 'Mode: Erasing Background' : 'របៀប៖ កំពុងលុបផ្ទៃខាងក្រោយ') : (isEn ? 'Mode: Restoring from Original' : 'របៀប៖ កំពុងស្តារពីរូបភាពដើម')}</span>
                <div className="flex gap-4">
                  <button onClick={handleRestoreFull} className="text-primary-600 hover:underline flex items-center gap-1">
                    <History className="w-3 h-3" /> {isEn ? 'Restore Full' : 'ស្តារទាំងអស់'}
                  </button>
                  <button onClick={() => {
                    const ctx = maskCanvasRef.current.getContext('2d');
                    ctx.clearRect(0,0, maskCanvasRef.current.width, maskCanvasRef.current.height);
                    renderEditor();
                  }} className="text-red-500 hover:underline flex items-center gap-1">
                    <Undo className="w-3 h-3" /> {isEn ? 'Reset Edits' : 'កំណត់ការកែប្រែឡើងវិញ'}
                  </button>
                </div>
              </div>
            </div>

            {/* Background & Eraser Controls */}
            <div className="space-y-6">
              {/* Brush Tools */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Paintbrush className="w-4 h-4 text-primary-500" />
                  {isEn ? 'Brush Tools' : 'ឧបករណ៍ជក់'}
                </h4>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditorMode('erase')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${editorMode === 'erase' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    <Eraser className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">{isEn ? 'Erase' : 'លុប'}</span>
                  </button>
                  <button 
                    onClick={() => setEditorMode('restore')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${editorMode === 'restore' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    <History className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">{isEn ? 'Restore' : 'ស្តារ'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>{isEn ? 'Brush Size' : 'ទំហំជក់'}</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary-500" />
                    {isEn ? 'Background' : 'ផ្ទៃខាងក្រោយ'}
                  </h4>
                  <button onClick={handleRotate} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 text-slate-500 transition-all">
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {['transparent', '#ffffff', '#2563eb', '#ef4444', '#10b981'].map(c => (
                    <button 
                      key={c} onClick={() => setBgColor(c)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${bgColor === c ? 'border-primary-500 scale-105' : 'border-transparent'}`}
                      style={{ backgroundColor: c === 'transparent' ? '#ccc' : c, backgroundImage: c === 'transparent' ? "url('https://www.transparenttextures.com/patterns/checkerboard.png')" : 'none' }}
                    />
                  ))}
                </div>

                <input type="file" id="bg-img-upload" className="hidden" onChange={handleBgImgUpload} accept="image/*" />
                <label 
                  htmlFor="bg-img-upload"
                  className="flex items-center gap-2 w-full p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-900"
                >
                  <LucideImage className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{isEn ? 'Set Background Image' : 'ប្តូររូបភាពផ្ទៃ'}</span>
                </label>
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  {isEn ? 'Download Result' : 'ទាញយកលទ្ធផល'}
                </button>
                <button onClick={reset} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-all uppercase font-bold tracking-wider">
                  {isEn ? 'Start New' : 'ចាប់ផ្តើមថ្មី'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!success && (
              <div className="space-y-6">
                {(files.length === 0 || config.multiple) && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer flex flex-col items-center gap-4 ${
                      isDragActive 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="bg-primary-100 dark:bg-primary-900/40 p-4 rounded-full">
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        {isDragActive ? (isEn ? 'Drop files here' : 'ទម្លាក់ឯកសារនៅទីនេះ') : (isEn ? 'Click or drag files to upload' : 'ចុច ឬអូសឯកសារដើម្បីផ្ទុកឡើង')}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {config.accept ? Object.values(config.accept).flat().join(', ').toUpperCase() : ''} (Max 20MB)
                      </p>
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto p-2">
                    {files.map((f, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 group">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                          <FileCheck className="w-5 h-5 text-primary-600" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {config.multiple && (
                            <>
                              <button 
                                onClick={() => moveFile(i, 'up')} 
                                disabled={i === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-30 transition-all"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => moveFile(i, 'down')} 
                                disabled={i === files.length - 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-30 transition-all"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => removeFile(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {processing && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                      <span>{isEn ? 'Processing...' : 'កំពុងដំណើរការ...'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-primary-600 h-2.5 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {!processing && (
                  <button
                    onClick={handleProcess}
                    disabled={processing || files.length === 0}
                    className="btn-primary w-full"
                  >
                    {config.buttonText}
                  </button>
                )}
              </div>
            )}

            {success && config.mode !== 'bg-remover' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 flex flex-col items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-full">
                    <FileCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">{config.successText}</h3>
                    <p className="text-green-600 dark:text-green-400 mt-1">{isEn ? 'Your result is ready.' : 'លទ្ធផលរបស់អ្នករួចរាល់ហើយ។'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex-1"
                  >
                    <Download className="w-5 h-5" />
                    {isEn ? 'Download Result' : 'ទាញយកលទ្ធផល'}
                  </button>
                  <button
                    onClick={reset}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex-1 border border-slate-200 dark:border-slate-700"
                  >
                    {isEn ? 'Try Again' : 'ព្យាយាមម្តងទៀត'}
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Converter;
