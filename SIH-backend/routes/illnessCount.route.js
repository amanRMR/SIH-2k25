import { Router } from 'express';
import {
    getOverallIllnessCount,
    getDistrictWiseIllnessCount,
    getSpecificDistrictIllnessCount,
    addIllnessToUser,
    removeIllnessFromUser
} from '../controllers/illnessCount.controller.js';

const router = Router();

// Get overall illness count from user illnesses array
router.get('/count/overall', getOverallIllnessCount);

// Get district-wise illness count
router.get('/count/district-wise', getDistrictWiseIllnessCount);

// Get specific district illness count
router.get('/count/district/:state/:district', getSpecificDistrictIllnessCount);

// Add illness to user
router.post('/users/:aadhaar/add', addIllnessToUser);

// Remove illness from user
router.delete('/users/:aadhaar/remove', removeIllnessFromUser);

export default router;
