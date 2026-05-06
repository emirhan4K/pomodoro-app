const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BadRequestException = require('../exceptions/BadRequestException');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // İsteğin geldiği URL 'rooms' içeriyor mu bakıyoruz
    const isRoom = req.originalUrl.includes('/rooms');
    
    // Fieldname 'banner' içeriyorsa banner, yoksa avatar klasörü
    const isBanner = file.fieldname.toLowerCase().includes('banner');
    
    let folderPath = isBanner ? 'banners' : 'avatars';
    
    // Eğer istek odadan geliyorsa başına 'rooms/' ekle
    if (isRoom) {
      folderPath = `rooms/${folderPath}`;
    }

    const uploadPath = path.join(__dirname, `../public/uploads/${folderPath}`);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // User kimliği veya anonim
    const userId = req.user ? req.user.id : 'user';
    cb(null, `${file.fieldname}_${userId}_${uniqueSuffix}${ext}`);
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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

module.exports = {
  uploadAvatar: upload, 
  uploadBanner: upload,
  upload: upload 
};