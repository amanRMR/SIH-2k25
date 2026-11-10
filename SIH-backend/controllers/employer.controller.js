import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Employer from "../models/employer.model.js";
import User from "../models/user.model.js";

// Register Employer
export const registerEmployer = asyncHandler(async (req, res) => {
    const { employerId, name, mobile, companyId, password } = req.body;

    if (!employerId || !name || !mobile || !companyId || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingEmployer = await Employer.findOne({ $or: [{ employerId }, { mobile }] });
    if (existingEmployer) {
        throw new ApiError(409, "Employer with this ID or Mobile already exists");
    }

    const employer = await Employer.create({
        employerId,
        name,
        mobile,
        companyId,
        password
    });

    const createdEmployer = await Employer.findById(employer._id).select("-password");

    return res.status(201).json(
        new ApiResponse(201, createdEmployer, "Employer registered successfully")
    );
});

// Login Employer
export const loginEmployer = asyncHandler(async (req, res) => {
    const { employerId, password } = req.body;

    if (!employerId || !password) {
        throw new ApiError(400, "Employer ID and Password are required");
    }

    const employer = await Employer.findOne({ employerId });
    if (!employer) {
        throw new ApiError(404, "Employer not found");
    }

    const isPasswordValid = await employer.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = employer.generateAccessToken();

    const loggedInEmployer = await Employer.findById(employer._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { employer: loggedInEmployer, accessToken },
                "Employer logged in successfully"
            )
        );
});

// Search Worker (Restricted View)
export const searchWorker = asyncHandler(async (req, res) => {
    const { aadhaar } = req.body;

    if (!aadhaar) {
        throw new ApiError(400, "Worker Aadhaar number is required");
    }

    const worker = await User.findOne({ aadhaar });

    if (!worker) {
        throw new ApiError(404, "Worker not found");
    }

    // Determine "Illness (Yes/No)" logic
    // Logic: If user has any record in 'illnesses' or 'chronicConditions', return Yes.
    // Or strictly active illnesses (no recoveryDate). 
    // Let's go with stricter: "Has active illness or chronic condition"
    const hasActiveIllness = worker.illnesses?.some(i => !i.recoveryDate) || false;
    const hasChronicCondition = (worker.healthRecords?.chronicConditions?.length > 0) || false;

    const illnessStatus = (hasActiveIllness || hasChronicCondition) ? "Yes" : "No";

    const restrictedData = {
        aadhaar: worker.aadhaar,
        name: worker.name,
        illness: illnessStatus
    };

    return res.status(200).json(
        new ApiResponse(200, restrictedData, "Worker details fetched fetched successfully")
    );
});

import CompanyWorker from "../models/companyWorker.model.js";

// ... (Preceding code remains same) ...

// Add Worker to Company Roster
export const addCompanyWorker = asyncHandler(async (req, res) => {
    const { aadhaar, name } = req.body;
    const employer = req.user;

    if (!aadhaar || !name) {
        throw new ApiError(400, "Aadhaar and Name are required");
    }

    // Check if checks exist?
    // Just create or update
    const worker = await CompanyWorker.findOneAndUpdate(
        { aadhaar, companyId: employer.companyId },
        {
            name,
            companyId: employer.companyId,
            aadhaar
        },
        { upsert: true, new: true }
    );

    return res.status(201).json(
        new ApiResponse(201, worker, "Worker added to company roster")
    );
});


// Get Company Workers List (New Logic)
export const getCompanyWorkers = asyncHandler(async (req, res) => {
    const employer = req.user;

    if (!employer || !employer.companyId) {
        throw new ApiError(400, "Employer company details not found");
    }

    // 1. Get the Roster from CompanyWorker table
    const roster = await CompanyWorker.find({ companyId: employer.companyId });

    if (!roster || roster.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No workers in company roster")
        );
    }

    // 2. Fetch User Details for these Aadhaar numbers
    const aadhaarList = roster.map(w => w.aadhaar);
    const users = await User.find({ aadhaar: { $in: aadhaarList } });

    // Create a map for fast lookup: aadhaar -> User
    const userMap = new Map();
    users.forEach(u => userMap.set(u.aadhaar, u));

    // 3. Construct Final List
    const result = roster.map(worker => {
        const user = userMap.get(worker.aadhaar);

        let illnessStatus = "NA";

        if (user) {
            const hasActiveIllness = user.illnesses?.some(i => !i.recoveryDate) || false;
            const hasChronicCondition = (user.healthRecords?.chronicConditions?.length > 0) || false;
            illnessStatus = (hasActiveIllness || hasChronicCondition) ? "Yes" : "No";
        }

        return {
            aadhaar: worker.aadhaar,
            name: worker.name,
            companyId: employer.companyId,
            illness: illnessStatus
        };
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Company workers list fetched successfully")
    );
});

// Update Worker Name
export const updateCompanyWorker = asyncHandler(async (req, res) => {
    const { aadhaar, name } = req.body;
    const employer = req.user;

    if (!aadhaar || !name) {
        throw new ApiError(400, "Aadhaar and Name are required");
    }

    const updatedWorker = await CompanyWorker.findOneAndUpdate(
        { aadhaar, companyId: employer.companyId },
        { name },
        { new: true }
    );

    if (!updatedWorker) {
        throw new ApiError(404, "Worker not found in company roster");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedWorker, "Worker details updated successfully")
    );
});

// Delete Worker from Roster
export const deleteCompanyWorker = asyncHandler(async (req, res) => {
    const { aadhaar } = req.body; // Or query param, but keeping body for consistency with POST
    const employer = req.user;

    if (!aadhaar) {
        throw new ApiError(400, "Aadhaar is required");
    }

    const deletedWorker = await CompanyWorker.findOneAndDelete({
        aadhaar,
        companyId: employer.companyId
    });

    if (!deletedWorker) {
        throw new ApiError(404, "Worker not found in company roster");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Worker removed from company roster successfully")
    );
});
