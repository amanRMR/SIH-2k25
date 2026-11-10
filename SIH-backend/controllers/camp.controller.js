import Camp from '../models/camp.model.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Create a new camp
const createCamp = asyncHandler(async (req, res) => {
    const { name, location, date, time, organizer, description, contact } = req.body;

    if (!name || !location || !date || !time || !organizer) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const camp = await Camp.create({
        name,
        location,
        date,
        time,
        organizer,
        description,
        contact
    });

    return res.status(201).json(
        new ApiResponse(201, camp, "Camp created successfully")
    );
});

// Get upcoming camps
const getUpcomingCamps = asyncHandler(async (req, res) => {
    const currentDate = new Date();

    // Find camps with date greater than or equal to today, sorted by date ascending
    const camps = await Camp.find({ date: { $gte: currentDate } }).sort({ date: 1 });

    return res.status(200).json(
        new ApiResponse(200, camps, "Upcoming camps retrieved successfully")
    );
});

// Get all camps (optional, for admin/history)
const getAllCamps = asyncHandler(async (req, res) => {
    const camps = await Camp.find().sort({ date: -1 });
    return res.status(200).json(
        new ApiResponse(200, camps, "All camps retrieved successfully")
    );
});

export {
    createCamp,
    getUpcomingCamps,
    getAllCamps
};
