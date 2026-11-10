import { Router } from 'express';
import {
    createUser,
    getUserByAadhaar,
    getCurrentUser,
    updateUser,
    loginUser,
    addPrescriptionWithFile,
    addLabReportWithFile,
    addImmunizationWithFile,
    getAllUsers,
    deleteUser,
    bookAppointment
} from '../controllers/user.controller.js';
import ApiError from '../utils/apiError.js';
import { upload } from '../middlewares/multer.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Get all users (with optional filtering) - PUBLIC
router.get('/', getAllUsers);

// User login
router.post('/login', loginUser);
router.get('/login', (req, res) => {
    throw new ApiError(405, "Method Not Allowed - Use POST to login");
});

// Create a new user
router.post('/create', createUser);

// Secured routes
router.use(verifyJWT);

// Get current user
router.get('/me', getCurrentUser);

// Get user by Aadhaar number
router.get('/:aadhaar', getUserByAadhaar);

// Update user details
router.put('/:aadhaar', updateUser);

// Add prescription with file upload
router.post('/:aadhaar/prescription', upload.single('file'), addPrescriptionWithFile);

// Add lab report with file upload
router.post('/:aadhaar/lab-report', upload.single('file'), addLabReportWithFile);

// Add immunization with file upload
router.post('/:aadhaar/immunization', upload.single('file'), addImmunizationWithFile);

// Delete user
router.delete('/:aadhaar', deleteUser);

//book appointment
router.post('/:aadhaar/appointment', bookAppointment);

export default router;
