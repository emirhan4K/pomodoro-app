const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BadRequestException = require('../exceptions/BadRequestException');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.fieldname === 'banner' ? 'banners' : 'avatars';
    const uploadPath = path.join(__dirname, `../public/uploads/${folder}`);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}_${req.user.id}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Sadece resim formatları (.jpg, .png, .webp) kabul edilir!'), false);
  }
};

const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } 
});

const uploadBanner = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = { uploadAvatar, uploadBanner };