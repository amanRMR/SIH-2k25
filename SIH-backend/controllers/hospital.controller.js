import HospitalLogin from "../models/hospital.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Create a hospital user (signup)
export const createHospitalUser = asyncHandler(async (req, res) => {
  const { hospitalId, userId, password, role, name } = req.body;

  if (!hospitalId || !userId || !password || !name) {
    throw new ApiError(400, "hospitalId, userId, password and name are required");
  }

  const existing = await HospitalLogin.findOne({ $or: [{ hospitalId, userId }, { userId }] });
  if (existing) {
    throw new ApiError(409, "Hospital user already exists");
  }

  const created = await HospitalLogin.create({
    hospitalId,
    userId,
    password, // Model will hash this
    role: role || undefined,
    name
  });

  return res.status(201).json(new ApiResponse(201, {
    id: created._id,
    hospitalId: created.hospitalId,
    userId: created.userId,
    role: created.role,
    name: created.name,
    createdAt: created.createdAt
  }, "Hospital user created"));
});

// Login a hospital user
export const loginHospitalUser = asyncHandler(async (req, res) => {
  const { hospitalId, userId, password } = req.body;

  if (!hospitalId || !userId || !password) {
    throw new ApiError(400, "hospitalId, userId and password are required");
  }

  const account = await HospitalLogin.findOne({ hospitalId, userId });
  if (!account) {
    throw new ApiError(404, "Hospital user not found");
  }

  const isPasswordValid = await account.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = account.generateAccessToken();
  const refreshToken = account.generateRefreshToken();

  account.refreshToken = refreshToken;
  account.lastLogin = new Date();
  await account.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true, // Always true for production-like security, but user might be on http localhost.
    // Ideally use process.env.NODE_ENV === 'production' ? true : false, but user asked for "high level security"
    // I'll set it to process.env.NODE_ENV === "production" to be safe for local dev if they haven't set up https
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      hospitalId: account.hospitalId,
      userId: account.userId,
      role: account.role,
      name: account.name,
      lastLogin: account.lastLogin,
      accessToken,
      refreshToken
    }, "Login successful"));
});

// Refresh Access Token
export const refreshHospitalAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await HospitalLogin.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Logout Hospital User
export const logoutHospitalUser = asyncHandler(async (req, res) => {
  await HospitalLogin.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 // remove the refresh token from the field
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
});

// List users by hospital
export const listHospitalUsers = asyncHandler(async (req, res) => {
  const { hospitalId } = req.query;
  const filter = hospitalId ? { hospitalId } : {};
  const users = await HospitalLogin.find(filter).select("hospitalId userId role name lastLogin createdAt");
  return res.status(200).json(new ApiResponse(200, { users }, "Hospital users retrieved"));
});

// Delete hospital user
export const deleteHospitalUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await HospitalLogin.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Hospital user not found");
  return res.status(200).json(new ApiResponse(200, {}, "Hospital user deleted"));
});

// Add Appointment
export const addAppointment = asyncHandler(async (req, res) => {
  const { username, doctorname, date, time, reason } = req.body;
  const hospitalId = req.body.hospitalId || req.query.hospitalId || req.user?.hospitalId;

  if (!username || !doctorname || !date || !time) {
    throw new ApiError(400, "username, doctorname, date, and time are required");
  }

  if (!hospitalId) {
    throw new ApiError(400, "hospitalId is required");
  }

  const updatedUser = await HospitalLogin.findOneAndUpdate(
    { hospitalId: hospitalId },
    {
      $push: {
        appointments: {
          username,
          doctorname,
          date,
          time,
          reason
        }
      }
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    // This implies the hospitalId does not exist in the HospitalLogin collection
    throw new ApiError(404, `Hospital user with ID ${hospitalId} not found`);
  }

  return res.status(200).json(new ApiResponse(200, { appointments: updatedUser.appointments }, "Appointment added successfully"));
});

// Get Appointments
export const getAppointments = asyncHandler(async (req, res) => {
  let hospitalUser = req.user;

  if (!hospitalUser) {
    const hospitalId = req.query.hospitalId || req.body.hospitalId;
    if (!hospitalId) {
      throw new ApiError(400, "hospitalId is required");
    }
    hospitalUser = await HospitalLogin.findOne({ hospitalId });
    if (!hospitalUser) {
      throw new ApiError(404, "Hospital user not found");
    }
  }

  return res.status(200).json(new ApiResponse(200, { appointments: hospitalUser.appointments }, "Appointments retrieved"));
});

// Add Supply
export const addSupply = asyncHandler(async (req, res) => {
  const { name, quantity, date } = req.body;
  const hospitalId = req.body.hospitalId || req.query.hospitalId;

  if (!name || !quantity || !date) {
    throw new ApiError(400, "name, quantity, and date are required");
  }

  let hospitalUser = req.user;

  if (!hospitalUser) {
    if (!hospitalId) {
      throw new ApiError(400, "hospitalId is required");
    }
    hospitalUser = await HospitalLogin.findOne({ hospitalId });
    if (!hospitalUser) {
      throw new ApiError(404, "Hospital user not found");
    }
  }

  hospitalUser.supplies.push({
    name,
    quantity,
    date
  });

  await hospitalUser.save();

  return res.status(200).json(new ApiResponse(200, { supplies: hospitalUser.supplies }, "Supply added successfully"));
});

// Get Supplies
export const getSupplies = asyncHandler(async (req, res) => {
  let hospitalUser = req.user;

  if (!hospitalUser) {
    const hospitalId = req.query.hospitalId || req.body.hospitalId;
    if (!hospitalId) {
      throw new ApiError(400, "hospitalId is required");
    }
    hospitalUser = await HospitalLogin.findOne({ hospitalId });
    if (!hospitalUser) {
      throw new ApiError(404, "Hospital user not found");
    }
  }

  return res.status(200).json(new ApiResponse(200, { supplies: hospitalUser.supplies }, "Supplies retrieved"));
});
