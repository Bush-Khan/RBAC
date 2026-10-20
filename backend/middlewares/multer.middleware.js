const multer = require('multer')
const path = require('path')

// storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-';
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

// file type
const fileType = (req, file, cb) => {
    const allowedTypes = ["image/jpg", "imag/png", "image/webp", "image/jpeg"]

    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only jpg, jpeg, webp, png are allowed'), false)
}

// max size of image
const upload = multer({
    storage, fileType, limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = upload