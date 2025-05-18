import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

// OAuth Provider ke liye sub-schema
const OAuthProviderSchema = new Schema({
    provider: {
        type: String,
        enum: ['google', 'github'], // Allowed providers
        required: true
    },
    providerId: {
        type: String,
        required: true // Unique ID from provider (e.g., Google sub, GitHub ID)
    }
}, { _id: false }); // No separate _id for sub-schema

// Main User Schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email toh chahiye bhai!"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Valid email daal na bhai!"]
    },
    password: {
        type: String,
        required: function() {
            return this.oauthProviders.length === 0; // Password sirf tab chahiye jab OAuth nahi hai
        },
        minlength: [8, "Password kam se kam 8 characters ka toh banta hai!"]
    },
    name: {
        type: String,
        required: [true, "Naam daal do bhai!"],
        trim: true
    },
    oauthProviders: [OAuthProviderSchema], // Array of OAuth providers
    workspaces: [{
        type: Schema.Types.ObjectId,
        ref: 'Workspace' // Agar tum workspaces track karna chahte ho
    }],
    collections: [{
        type: Schema.Types.ObjectId,
        ref: 'Collection' // API collections ke liye
    }],
    requests: [{
        type: Schema.Types.ObjectId,
        ref: 'Request' // API requests ke liye
    }],
    environments: [{
        type: Schema.Types.ObjectId,
        ref: 'Environment' // Environment variables ke liye, bhai!
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // createdAt aur updatedAt automatically handle honge

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ "oauthProviders.provider": 1, "oauthProviders.providerId": 1 });
UserSchema.index({ environments: 1 }); // Index for environments

// Password hash karne ke liye pre-save hook
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check if user is OAuth-based
UserSchema.methods.isOAuthUser = function() {
    return this.oauthProviders.length > 0;
};

// Password compare karne ke liye method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Model export karo
const User = mongoose.model('User', UserSchema);
export default User;