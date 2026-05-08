const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary'); 
const BadRequestException = require('../exceptions/BadRequestException');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isRoom = req.originalUrl.includes('/rooms');
    const isBanner = file.fieldname.toLowerCase().includes('banner');
    
    let folderPath = isBanner ? 'banners' : 'avatars';
    
    if (isRoom) {
      folderPath = `rooms/${folderPath}`;
    }
    return {
      folder: `pomodoro_app/${folderPath}`, 
      allowed_formats: ['jpeg', 'jpg', 'png', 'webp']
    };
  },
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