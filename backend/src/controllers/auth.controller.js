
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
        
console.log("Verification diagnostic:", {
    emailReceived: Boolean(email),
    tokenReceived: Boolean(token),
    tokenLength: token.length
});


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

module.exports = {
  register,
  login,
  verifyEmail,
};