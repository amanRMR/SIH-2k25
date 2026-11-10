import { Router } from "express";
import {
  createHospitalUser,
  loginHospitalUser,
  listHospitalUsers,
  deleteHospitalUser,
  addAppointment,
  getAppointments,
  addSupply,
  getSupplies,
  refreshHospitalAccessToken,
  logoutHospitalUser
} from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", createHospitalUser);
router.post("/login", loginHospitalUser);
router.post("/refresh-token", refreshHospitalAccessToken);
router.post("/logout", verifyJWT, logoutHospitalUser);

router.get("/", listHospitalUsers);
router.delete("/:id", deleteHospitalUser);

router.post("/appointments", verifyJWT, addAppointment);
router.get("/appointments", verifyJWT, getAppointments);

router.get("/supplies", verifyJWT, getSupplies);
router.post("/supplies", verifyJWT, addSupply);

export default router;


