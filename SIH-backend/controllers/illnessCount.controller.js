import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get overall illness count from user illnesses array
const getOverallIllnessCount = asyncHandler(async (req, res) => {
    const { state, district, illness, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (state) {
        filter.currentState = state;
    }
    
    if (district) {
        filter['address.district'] = district;
    }
    
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    // Illness breakdown: { illnessName, count }
    const illnessBreakdown = await User.aggregate([
        { $match: filter },
        { $unwind: '$illnesses' },
        { $group: { _id: '$illnesses.illnessName', count: { $sum: 1 } } },
        { $project: { _id: 0, illnessName: '$_id', count: 1 } },
        { $sort: { count: -1 } }
    ]);

    return res.status(200).json(illnessBreakdown);
});

// Get district-wise illness count
const getDistrictWiseIllnessCount = asyncHandler(async (req, res) => {
    const { state, illness, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (state) {
        filter.currentState = state;
    }
    
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    // Flat array: { district, illnessName, count }
    // If state is provided, results are from that state; otherwise all states
    const rows = await User.aggregate([
        { $match: filter },
        { $unwind: '$illnesses' },
        { $group: {
            _id: { district: '$address.district', illnessName: '$illnesses.illnessName' },
            count: { $sum: 1 }
        }},
        { $project: { _id: 0, district: '$_id.district', illnessName: '$_id.illnessName', count: 1 } },
        { $sort: { district: 1, count: -1 } }
    ]);

    return res.status(200).json(rows);
});

// Get specific district illness count
const getSpecificDistrictIllnessCount = asyncHandler(async (req, res) => {
    const { state, district } = req.params;
    const { illness, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {
        currentState: state,
        'address.district': district
    };
    
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    // Get total illness count for the district
    const totalIllnessCount = await User.aggregate([
        { $match: filter },
        { $unwind: '$illnesses' },
        { $count: 'total' }
    ]);

    // Get illness breakdown for the district
    const illnessBreakdown = await User.aggregate([
        { $match: filter },
        { $unwind: '$illnesses' },
        {
            $group: {
                _id: '$illnesses',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Get unique users with illnesses in this district
    const usersWithIllnesses = await User.aggregate([
        { $match: { ...filter, illnesses: { $exists: true, $not: { $size: 0 } } } },
        { $count: 'count' }
    ]);

    // Get specific illness count if provided
    let specificIllnessCount = null;
    if (illness) {
        const specificCount = await User.aggregate([
            { $match: { ...filter, illnesses: illness } },
            { $count: 'count' }
        ]);
        specificIllnessCount = specificCount[0]?.count || 0;
    }

    return res.status(200).json(
        new ApiResponse(200, {
            state,
            district,
            totalIllnessCount: totalIllnessCount[0]?.total || 0,
            usersWithIllnesses: usersWithIllnesses[0]?.count || 0,
            illnessBreakdown,
            specificIllnessCount,
            filters: {
                illness,
                startDate,
                endDate
            }
        }, "District illness count retrieved successfully")
    );
});

// Add illness to user
const addIllnessToUser = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { illness } = req.body;

    if (!aadhaar || !illness) {
        throw new ApiError(400, "Aadhaar number and illness are required");
    }

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if illness already exists
    if (user.illnesses && user.illnesses.includes(illness)) {
        throw new ApiError(409, "Illness already exists for this user");
    }

    // Add illness to user
    const updatedUser = await User.findOneAndUpdate(
        { aadhaar },
        { $push: { illnesses: illness } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Illness added successfully")
    );
});

// Remove illness from user
const removeIllnessFromUser = asyncHandler(async (req, res) => {
    const { aadhaar } = req.params;
    const { illness } = req.body;

    if (!aadhaar || !illness) {
        throw new ApiError(400, "Aadhaar number and illness are required");
    }

    const user = await User.findOne({ aadhaar });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Remove illness from user
    const updatedUser = await User.findOneAndUpdate(
        { aadhaar },
        { $pull: { illnesses: illness } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Illness removed successfully")
    );
});

export {
    getOverallIllnessCount,
    getDistrictWiseIllnessCount,
    getSpecificDistrictIllnessCount,
    addIllnessToUser,
    removeIllnessFromUser
};
