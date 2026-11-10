// routes/admin.routes.js
import { Router } from "express";
import {
  createAdmin,
  loginAdmin,
  listAdmins,
  deleteAdmin,
  refreshAdminAccessToken,
  logoutAdmin
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", createAdmin);            // signup
router.post("/login", loginAdmin);       // login
router.post("/refresh-token", refreshAdminAccessToken);
router.post("/logout", verifyJWT, logoutAdmin);

router.get("/", verifyJWT, listAdmins);              // list with optional filters
router.delete("/:id", verifyJWT, deleteAdmin);      // delete

export default router;
