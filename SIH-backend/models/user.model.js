import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    aadhaar: {
        type: String,
        required: true, unique: true
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    age: Number,
    dob: Date,
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    heightCm: Number,
    weightKg: Number,

    contact: {
        phone: String,
        email: String,
    },

    originState: String,
    currentState: String,
    address: {
        local: String,
        district: String,
        pincode: String,
    },

    healthRecords: {
        prescriptions: [{
            date: {
                type: Date,
                default: Date.now
            },
            url: String,
            doctorName: String,
            hospitalName: String,
            notes: String
        }],
        labReports: [{
            date: {
                type: Date,
                default: Date.now
            },
            url: String,
            labName: String,
            testType: String,
            notes: String
        }],
        immunizations: [{
            vaccine: String,
            date: {
                type: Date,
                default: Date.now
            },
            dose: Number,
            fileUrl: String,
            doctorName: String,
            notes: String
        }],
        allergies: [String],
        chronicConditions: [String],
    },
    illnesses: [
        {
            illnessName: String,
            diagnosisDate: Date,
            recoveryDate: Date,
        }
    ],
    appointment: [
        {
            hospital: String,
            doctor: String,
            date: Date,
            time: String,
            reason: String,
        }
    ],
    languagePreference: {
        type: String,
        default: "English"
    },
    occupation: String,
    consentGiven: {
        type: Boolean,
        default: true
    }
});

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            aadhaar: this.aadhaar,
            name: this.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    )
}

const User = mongoose.model("User", userSchema);
export default User;
