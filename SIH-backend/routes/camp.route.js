import { Router } from 'express';
import { createCamp, getUpcomingCamps, getAllCamps } from '../controllers/camp.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; // Optional: if you want to protect creation

const router = Router();

// Public route to get upcoming camps
router.get('/upcoming', getUpcomingCamps);

// Route to create a camp (Should ideally be protected for Admins/Hospitals)
// For now, I'll leave it open or you can uncomment verifyJWT
router.post('/create', createCamp);

// Get all camps
router.get('/all', getAllCamps);

export default router;
