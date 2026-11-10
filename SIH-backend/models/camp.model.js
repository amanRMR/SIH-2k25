import mongoose from "mongoose";

const campSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    contact: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Camp = mongoose.model("Camp", campSchema);
export default Camp;
