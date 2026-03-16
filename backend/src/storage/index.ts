import localUpload from "./local";
import { Multer } from "multer";

const storage = process.env.FILE_STORAGE ?? "local";

let upload: Multer;

if (storage === "local") {
  upload = localUpload;
} else {
  throw new Error(`Unsupported file storage: ${storage}`);
}

export default upload;