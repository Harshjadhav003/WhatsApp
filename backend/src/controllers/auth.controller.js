
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    sendVerificationEmail
} = require("../services/email.service");

// Register Controller
const register = async (req, res) => {
    try {
        const { name, password } = req.body;

        const normalizedEmail =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const normalizedName =
            typeof name === "string" ? name.trim() : "";

        // Step 1: Validate input
        if (!normalizedName || !normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (normalizedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters"
            });
        }

        if (
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Step 2: Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Step 3: Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 4: Generate secure verification token
        const verificationToken =
            crypto.randomBytes(32).toString("hex");

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const verificationExpiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        );

        // Step 5: Create an unverified account
        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            emailVerified: false,
            emailVerificationTokenHash: verificationTokenHash,
            emailVerificationExpiresAt: verificationExpiresAt
        });
       
        // Step 6: Build verification link
        const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:5173";

        const verificationUrl =
            `${frontendUrl}/verify-email?token=${verificationToken}` +
            `&email=${encodeURIComponent(normalizedEmail)}`;

        // Step 7: Log link locally or send email in production
        if (process.env.NODE_ENV === "development") {
            console.log("\n--- LOCAL EMAIL VERIFICATION LINK ---");
            console.log(verificationUrl);
            console.log("-------------------------------------\n");
        } else {
            try {
                await sendVerificationEmail({
                    to: normalizedEmail,
                    name: normalizedName,
                    verificationUrl
                });
            } catch (emailError) {
                await user.deleteOne();
                throw emailError;
            }
        }



        // Step 8: Return registration success
        return res.status(201).json({
            success: true,
            message: "Account created. Check your email to verify it.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error("Register error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Could not complete registration. Please try again."
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const token =
            typeof req.query.token === "string"
                ? req.query.token
                : "";

        const email =
            typeof req.query.email === "string"
                ? req.query.email.trim().toLowerCase()
                : "";

        if (!token || !email) {
            return res.status(400).json({
                success: false,
                message: "Verification token and email are required."
            });
        }
        
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            email,
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Verification link is invalid or expired."
            });
        }

        user.emailVerified = true;
        user.emailVerificationTokenHash = undefined;
        user.emailVerificationExpiresAt = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in."
        });
    } catch (error) {
        console.error("Email verification error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not verify email. Please try again."
        });
    }
};


const resendVerificationEmail = async (req, res) => {
    try {
        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const user = await User.findOne({ email });

        // Use a generic response to avoid revealing account existence.
        if (!user || user.emailVerified === true) {
            return res.status(200).json({
                success: true,
                message:
                    "If the account needs verification, a verification link will be provided."
            });
        }

        const verificationToken =
            crypto.randomBytes(32).toString("hex");

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationTokenHash = verificationTokenHash;
        user.emailVerificationExpiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await user.save();

        const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:5173";

        const verificationUrl =
            `${frontendUrl}/verify-email?token=${verificationToken}` +
            `&email=${encodeURIComponent(email)}`;

        if (process.env.NODE_ENV === "development") {
            console.log("\n--- LOCAL EMAIL VERIFICATION LINK ---");
            console.log(verificationUrl);
            console.log("-------------------------------------\n");
        } else {
            await sendVerificationEmail({
                to: email,
                name: user.name,
                verificationUrl
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "If the account needs verification, a verification link will be provided."
        });
    } catch (error) {
        console.error("Resend verification error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not process the request. Please try again."
        });
    }
};


// Login Controller
const login = async (req, res) => {
    try {
        const { password } = req.body;

        const normalizedEmail =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        // Step 1: Validate input
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        if (typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid input"
            });
        }
        // Step 2: Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            console.log("Login failed: no matching user");
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // Step 3: Compare password
        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

      // Require email verification before login
        if (user.emailVerified !== true) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // Email verification enforcement will be added
        // after the verification endpoint is implemented.

        // Step 4: Generate JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Step 5: Login success
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const normalizePhoneNumber = (value) => {
    if (typeof value !== "string") return "";

    const digits = value.replace(/\D/g, "");
    const nationalNumber =
        digits.startsWith("91") && digits.length === 12
            ? digits.slice(2)
            : digits;

    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
        return "";
    }

    return `+91${nationalNumber}`;
};

const requestPhoneOtp = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== "development") {
            return res.status(503).json({
                success: false,
                message: "Development OTP is disabled outside development mode."
            });
        }

        const phoneNumber = normalizePhoneNumber(req.body.phoneNumber);

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Indian mobile number."
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user.phoneVerified && user.phoneNumber === phoneNumber) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already verified."
            });
        }

        // Prevent another account from claiming this number.
        const existingUser = await User.findOne({
            _id: { $ne: user._id },
            $or: [
                { phoneNumber },
                { pendingPhoneNumber: phoneNumber }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already associated with another account."
            });
        }

        const now = Date.now();
        const cooldownMs = 60 * 1000;

        if (
            user.phoneOtpLastSentAt &&
            now - user.phoneOtpLastSentAt.getTime() < cooldownMs
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait 60 seconds before requesting another OTP."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        user.pendingPhoneNumber = phoneNumber;
        user.phoneOtpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");
        user.phoneOtpExpiresAt = new Date(now + 5 * 60 * 1000);
        user.phoneOtpAttempts = 0;
        user.phoneOtpLastSentAt = new Date(now);

        await user.save();

        // Development only. Never log OTPs in production.
        console.log(`[DEV ONLY] Phone OTP for ${phoneNumber}: ${otp}`);

        return res.status(200).json({
            success: true,
            message: "Development OTP generated. Check the backend terminal."
        });
    } catch (error) {
        console.error("Request phone OTP error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already in use."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Could not request OTP."
        });
    }
};

const verifyPhoneOtp = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== "development") {
            return res.status(503).json({
                success: false,
                message: "Development OTP is disabled outside development mode."
            });
        }

        const otp =
            typeof req.body.otp === "string"
                ? req.body.otp.trim()
                : "";

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit OTP."
            });
        }

        // Verify the OTP against the authenticated account.
        const user = await User.findById(req.user.userId);

        if (!user || !user.pendingPhoneNumber) {
            return res.status(400).json({
                success: false,
                message: "No pending phone verification found."
            });
        }

        if (
            !user.phoneOtpHash ||
            !user.phoneOtpExpiresAt ||
            user.phoneOtpExpiresAt.getTime() <= Date.now() ||
            user.phoneOtpAttempts >= 5
        ) {
            user.phoneOtpHash = undefined;
            user.phoneOtpExpiresAt = undefined;
            user.phoneOtpAttempts = 0;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP is invalid, expired, or attempts are exhausted. Request a new OTP."
            });
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        if (submittedHash !== user.phoneOtpHash) {
            user.phoneOtpAttempts += 1;

            if (user.phoneOtpAttempts >= 5) {
                user.phoneOtpHash = undefined;
                user.phoneOtpExpiresAt = undefined;
            }

            await user.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        // Promote the pending number only after successful verification.
        user.phoneNumber = user.pendingPhoneNumber;
        user.pendingPhoneNumber = undefined;
        user.phoneVerified = true;
        user.phoneOtpHash = undefined;
        user.phoneOtpExpiresAt = undefined;
        user.phoneOtpAttempts = 0;
        user.phoneOtpLastSentAt = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Phone number verified successfully.",
            phoneNumber: user.phoneNumber,
            phoneVerified: user.phoneVerified
        });
    } catch (error) {
        console.error("Verify phone OTP error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This phone number is already in use."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Could not verify OTP."
        });
    }
};
module.exports = {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    requestPhoneOtp,
    verifyPhoneOtp
};