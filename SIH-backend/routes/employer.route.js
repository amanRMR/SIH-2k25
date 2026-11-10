import { Router } from "express";
import {
    registerEmployer,
    loginEmployer,
    searchWorker,
    getCompanyWorkers,
    addCompanyWorker,
    updateCompanyWorker,
    deleteCompanyWorker
} from "../controllers/employer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerEmployer);
router.route("/login").post(loginEmployer);

// Protected Routes
router.route("/search").post(verifyJWT, searchWorker);

// Access Roster
router.route("/workers")
    .get(verifyJWT, getCompanyWorkers)
    .put(verifyJWT, updateCompanyWorker)      // Update Name
    .delete(verifyJWT, deleteCompanyWorker);  // Remove Worker

router.route("/workers/add").post(verifyJWT, addCompanyWorker);

export default router;
