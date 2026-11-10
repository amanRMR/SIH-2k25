import multer from 'multer';

// Use memory storage for serverless/deployed environments where disk writes may fail
const storage = multer.memoryStorage();

export const upload = multer({ storage });