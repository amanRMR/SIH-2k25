// controllers/admin.controller.js
import Admin from "../models/admin.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Create an admin (signup)
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Admin with this email already exists");
  }

  const created = await Admin.create({
    name,
    email,
    password, // Model will hash this
    role: role || undefined, // defaults to 'admin' by schema
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          id: created._id,
          name: created.name,
          email: created.email,
          role: created.role,
          createdAt: created.createdAt,
        },
        "Admin created"
      )
    );
});

// Login an admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const account = await Admin.findOne({ email });
  if (!account) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await account.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = account.generateAccessToken();
  const refreshToken = account.generateRefreshToken();

  account.refreshToken = refreshToken;
  // Optional: track lastLogin for admins too (add to schema if desired)
  account.updatedAt = new Date();
  await account.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true // Set to false for HTTP support
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          id: account._id,
          name: account.name,
          email: account.email,
          role: account.role,
          accessToken,
          refreshToken
        },
        "Login successful"
      )
    );
});

// Refresh Access Token
export const refreshAdminAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await Admin.findById(decodedToken?._id);

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

// Logout Admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Admin logged out"))
});

// List admins (optionally filter by role or email)
export const listAdmins = asyncHandler(async (req, res) => {
  const { role, email } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (email) filter.email = email;

  const admins = await Admin.find(filter).select(
    "name email role createdAt updatedAt"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { admins }, "Admins retrieved"));
});

// Delete admin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Admin.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Admin not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deleted"));
});
