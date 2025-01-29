import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Konfigurasi penyimpanan di Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
});

// Middleware untuk menangani upload
const upload = multer({ storage });

export default upload;
