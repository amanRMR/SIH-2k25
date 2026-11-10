import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const hospitalLoginSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
    unique: true, // Each hospital should have a unique ID
  },
  userId: {
    type: String,
    required: true,
    unique: true, // Each user login within a hospital should be unique
  },
  password: {
    type: String,
    required: true, // Store hashed passwords, never plain text
  },
  role: {
    type: String,
    enum: ["Admin", "Doctor", "Nurse", "Staff"], // Optional: define roles
    default: "Staff"
  },
  name: {
    type: String,
    required: true
  },
  appointments: [
    {
      username: {
        type: String,
        required: true
      },
      doctorname: {
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
      reason: {
        type: String
      }
    }
  ],
  supplies: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        required: true
      }
    }
  ],
  refreshToken: {
    type: String
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

hospitalLoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hospitalLoginSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

hospitalLoginSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      hospitalId: this.hospitalId,
      userId: this.userId,
      role: this.role,
      type: 'hospital'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m" // Short lived access token
    }
  )
}

hospitalLoginSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, // Fallback if REFRESH_TOKEN_SECRET not set
    {
      expiresIn: "7d"
    }
  )
}

const HospitalLogin = mongoose.model("HospitalLogin", hospitalLoginSchema);
export default HospitalLogin;
