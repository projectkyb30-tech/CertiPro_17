const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimit');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // STRICT FILTER: Only images and PDFs allowed for security
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const allowedExtensions = /^\.(jpg|jpeg|png|gif|pdf)$/i;

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF and PDF are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload endpoint - Protected by authenticateUser and rate limited
router.post('/upload', uploadLimiter, authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}${path.extname(req.file.originalname)}`;
    
    // Upload to Supabase Storage (Bucket: 'uploads')
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      if (error.message?.includes('bucket not found') || error.error === 'Bucket not found') {
        console.error('Supabase Storage bucket "uploads" not found. Please create it in Supabase Dashboard.');
        return sendError(res, 'Storage configuration error: bucket "uploads" missing', 500);
      }
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filename);
    
    sendSuccess(res, { 
      url: publicUrl,
      filename: filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      provider: 'supabase'
    }, 'File uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    sendError(res, error.message || 'Failed to upload file');
  }
});

module.exports = { uploadRouter: router };
