const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadBook , getMyBook, getBookById } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null , `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter
});

router.post('/', protect, upload.single('pdfFile'), uploadBook);

router.get('/', protect, getMyBook);

router.get('/:id', protect, getBookById);

module.exports = router;
