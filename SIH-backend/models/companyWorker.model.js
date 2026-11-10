import mongoose from "mongoose";

const companyWorkerSchema = new mongoose.Schema({
    aadhaar: {
        type: String,
        required: true,
        trim: true
        // Not unique globally, because a worker might work for multiple companies over time? 
        // But for current active employment, maybe unique per companyId. 
        // However, simplicity first: Aadhaar + CompanyId should typically be unique.
    },
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true,
        index: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Composite index to ensure a worker isn't added twice to the SAME company
companyWorkerSchema.index({ aadhaar: 1, companyId: 1 }, { unique: true });

const CompanyWorker = mongoose.model("CompanyWorker", companyWorkerSchema);
export default CompanyWorker;
