const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './posters',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Solo imágenes JPG/PNG'));
    }
    cb(null, true);
  },
});

module.exports = upload;