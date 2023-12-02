// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const sanitizedFileName = file.originalname.replace(/[^\w.]/g, "_");
    cb(null, sanitizedFileName);
  },
});

const upload = multer({ storage: storage });

const uploadMultipleMiddleware = upload.array("images", 5); // Adjust the limit as needed

module.exports = uploadMultipleMiddleware;
