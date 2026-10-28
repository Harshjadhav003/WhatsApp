const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, 
            trim: true
        },
        email: {
            type: String,
            required: true, 
            unique: true,
            lowercase: true,
            trim: true
        },
                emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationTokenHash: {
            type: String,
            default: undefined
        },
        emailVerificationExpiresAt: {
            type: Date,
            default: undefined
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilePic: {
            type: String, // Fixed: changed "Image" to "String" (for URLs/base64 strings)
            default: ""
        },
        about: {
            type: String,
            default: "Hey there! I am using WhatsApp."
        },
        isonline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;