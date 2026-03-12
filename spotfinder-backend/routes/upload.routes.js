const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Memory Storage for Multer
const storage = multer.memoryStorage();
const parser = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload route
router.post('/', protect, parser.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedFormats.includes(req.file.mimetype)) {
             return res.status(400).json({ error: 'Invalid file format. Only JPG, PNG, and WEBP are allowed.' });
        }

        // Upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'spotfinder',
                format: req.file.mimetype.split('/')[1],
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return res.status(500).json({ error: 'Image upload failed on Cloudinary' });
                }
                
                // Return the secure URL from Cloudinary
                res.json({
                    imageUrl: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        // Pipe the buffer to the stream
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Upload Error Handle:', error);
        res.status(500).json({ error: 'Image upload process failed' });
    }
});

module.exports = router;
