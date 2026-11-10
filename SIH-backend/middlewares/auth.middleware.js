import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import HospitalLogin from "../models/hospital.model.js";
import Employer from "../models/employer.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        let user;

        if (decodedToken.type === 'admin') {
            user = await Admin.findById(decodedToken._id).select("-password");
        } else if (decodedToken.type === 'hospital') {
            user = await HospitalLogin.findById(decodedToken._id).select("-password");
        } else if (decodedToken.type === 'employer') {
            user = await Employer.findById(decodedToken._id).select("-password");
        } else {
            user = await User.findById(decodedToken?._id).select("-password");
        }

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
