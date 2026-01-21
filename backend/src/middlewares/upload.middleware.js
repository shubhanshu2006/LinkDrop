import multer from "multer";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

// Allowed mime types for upload
const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  "video/mp4",
  "application/zip",
];

// Decides where the file will be stored and its name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src/uploads/files"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const secureName = crypto.randomUUID();
    cb(null, `${secureName}${ext}`);
  },
});

// Filters files based on their mime types
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("File type not allowed"), false);
  }
  cb(null, true);
};

// Multer upload middleware
export const uploadFile = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
