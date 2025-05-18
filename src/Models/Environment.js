import mongoose from "mongoose";

const { Schema } = mongoose;

// Environment Variable ke liye sub-schema
const EnvironmentVariableSchema = new Schema({
    key: {
        type: String,
        required: [true, "Key toh daal bhai!"],
        trim: true
    },
    value: {
        type: String,
        required: [true, "Value bhi chahiye bhai!"],
        trim: true
    }
}, { _id: false }); // No separate _id for sub-schema

// Main Environment Schema
const EnvironmentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Environment ka naam daal do bhai!"],
        trim: true,
        unique: true // Ensure unique environment names
    },
    variables: [EnvironmentVariableSchema], // Array of key-value pairs
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID chahiye bhai!"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for faster queries
EnvironmentSchema.index({ name: 1, user: 1 });

// Model export karo
const Environment = mongoose.model('Environment', EnvironmentSchema);
export default Environment;