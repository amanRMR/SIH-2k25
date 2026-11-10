import { Router } from "express";
import { 
  getIllnessWisePrediction, 
  getLocationWisePrediction, 
  getIllnessTrendAnalysis 
} from "../controllers/prediction.controller.js";

const router = Router();

// Illness-wise month-end prediction
// Example: /api/predictions/illness-wise?illnessName=Fever&state=Delhi&district=Central%20Delhi
router.get("/illness-wise", getIllnessWisePrediction);

// Location-wise illness prediction (top illnesses for a location)
// Example: /api/predictions/location-wise?state=Delhi&district=Central%20Delhi
router.get("/location-wise", getLocationWisePrediction);

// Illness trend analysis
// Example: /api/predictions/trend-analysis?illnessName=Fever&state=Delhi
router.get("/trend-analysis", getIllnessTrendAnalysis);

export default router;
