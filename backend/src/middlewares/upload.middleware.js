import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

// Allowed mime types
const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  "video/mp4",
  "application/zip",
];

// Multer memory storage 
export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("File type not allowed"), false);
    }
    cb(null, true);
  },
});
