import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const employerSchema = new mongoose.Schema({
    employerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    companyId: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
employerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
employerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
employerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            employerId: this.employerId,
            type: "employer"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const Employer = mongoose.model("Employer", employerSchema);
export default Employer;
