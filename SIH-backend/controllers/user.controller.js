// controllers/user.js
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Create a new user
// Create one or multiple users
const createUser = asyncHandler(async (req, res) => {
    let users = req.body;

    // Ensure request body is an array
    if (!Array.isArray(users)) {
        users = [users];
    }

    // Validate required fields for each user
    for (const user of users) {
        if (!user.aadhaar || !user.name) {
            throw new ApiError(400, "Each user must have Aadhaar number and name");
        }
    }

    // Check for duplicates (existing users in DB)
    const aadhaarNumbers = users.map(u => u.aadhaar);
    const existingUsers = await User.find({ aadhaar: { $in: aadhaarNumbers } });

    if (existingUsers.length > 0) {
        const existingAadhaars = existingUsers.map(u => u.aadhaar);
        throw new ApiError(
            409,
            `Users with Aadhaar numbers already exist: ${existingAadhaars.join(", ")}`
        );
    }

    // Map users with defaults
    const userData = users.map(user => ({
        aadhaar: user.aadhaar,
        name: user.name,
        ...(user.password && { password: user.password }),
        ...(user.age && { age: user.age }),
        ...(user.dob && { dob: new Date(user.dob) }),
        ...(user.gender && { gender: user.gender }),
        ...(user.bloodGroup && { bloodGroup: user.bloodGroup }),
        ...(user.heightCm && { heightCm: user.heightCm }),
        ...(user.weightKg && { weightKg: user.weightKg }),
        ...(user.contact && { contact: user.contact }),
        ...(user.originState && { originState: user.originState }),
        ...(user.currentState && { currentState: user.currentState }),
        ...(user.address && { address: user.address }),
        ...(user.healthRecords && { healthRecords: user.healthRecords }),
        ...(user.illnesses && { illnesses: user.illnesses }),
        ...(user.occupation && { occupation: user.occupation }),
        languagePreference: user.languagePreference || "English",
        consentGiven: user.consentGiven !== undefined ? user.consentGiven : true,
    }));

    // Hash passwords if provided
    for (const user of userData) {
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }

    // Insert many users at once
    const insertedUsers = await User.insertMany(userData, { ordered: false });

    return res.status(201).json(
        new ApiResponse(201, insertedUsers, "Users created successfully")
    );
});

// Get user by Aadhaar
const getUserByAadhaar = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar number is required");
    }

    const user = await User.findOne({ aadhaar });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User retrieved successfully")
    );
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});

// Update user details
const updateUser = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const updateData = req.body;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar number is required");
    }

    // Remove aadhaar from update data to prevent modification
    delete updateData.aadhaar;

    // Hash password if present in update
    if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findOneAndUpdate(
        { aadhaar },
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

// Add prescription with file upload
const addPrescriptionWithFile = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { doctorName, hospitalName, notes } = req.body;
    const { file } = req;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar number is required");
    }

    if (!file) {
        throw new ApiError(400, "Prescription file is required");
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(400, "Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed");
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new ApiError(400, "File size too large. Maximum size is 5MB");
    }

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    try {
        // Convert file buffer to Base64 string
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const prescriptionData = {
            url: dataURI,
            doctorName: doctorName || '',
            hospitalName: hospitalName || '',
            notes: notes || ''
        };

        const updatedUser = await User.findOneAndUpdate(
            { aadhaar },
            { $push: { 'healthRecords.prescriptions': prescriptionData } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "Prescription added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "File upload failed: " + error.message);
    }
});

// Add lab report with file upload
const addLabReportWithFile = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { labName, testType, notes } = req.body;
    const { file } = req;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar number is required");
    }

    if (!file) {
        throw new ApiError(400, "Lab report file is required");
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(400, "Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed");
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new ApiError(400, "File size too large. Maximum size is 5MB");
    }

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    try {
        // Convert file buffer to Base64 string
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const labReportData = {
            url: dataURI,
            labName: labName || '',
            testType: testType || '',
            notes: notes || ''
        };

        const updatedUser = await User.findOneAndUpdate(
            { aadhaar },
            { $push: { 'healthRecords.labReports': labReportData } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "Lab report added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "File upload failed: " + error.message);
    }
});

// Add immunization with file upload
const addImmunizationWithFile = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { vaccine, dose, doctorName, notes } = req.body;
    const { file } = req;

    if (!aadhaar || !vaccine) {
        throw new ApiError(400, "Aadhaar number and vaccine name are required");
    }

    if (!file) {
        throw new ApiError(400, "Immunization certificate file is required");
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(400, "Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed");
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new ApiError(400, "File size too large. Maximum size is 5MB");
    }

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    try {
        // Convert file buffer to Base64 string
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const immunizationData = {
            vaccine,
            dose: dose || 1,
            fileUrl: dataURI,
            doctorName: doctorName || '',
            notes: notes || ''
        };

        const updatedUser = await User.findOneAndUpdate(
            { aadhaar },
            { $push: { 'healthRecords.immunizations': immunizationData } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "Immunization record added successfully")
        );
    } catch (error) {
        throw new ApiError(500, "File upload failed: " + error.message);
    }
});

// Get all users (with pagination)
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10000, state, bloodGroup, occupation } = req.query;

    const filter = {};
    if (state) filter.currentState = state;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (occupation) filter.occupation = occupation;

    const users = await User.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit); // Exclude sensitive health data

    const total = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Users retrieved successfully")
    );
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar number is required");
    }

    const deletedUser = await User.findOneAndDelete({ aadhaar });

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
});

// Login user with Aadhaar and password
const loginUser = asyncHandler(async (req, res) => {
    const { aadhaar, password } = req.body;

    const user = await User.findOne({ aadhaar }).select('+password');
    if (!user || !user.password) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }
    const accessToken = user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: false // Set to false for HTTP support
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    ...loggedInUser.toObject(),
                    accessToken
                },
                "User logged in Successfully"
            )
        );
});

const bookAppointment = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { hospital, doctor, date, time, reason } = req.body;

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const appointmentData = {
        hospital,
        doctor,
        date,
        time,
        reason
    };

    user.appointment.push(appointmentData);
    await user.save();

    return res.status(201).json(
        new ApiResponse(201, appointmentData, "Appointment booked successfully")
    );
});

export {
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
};