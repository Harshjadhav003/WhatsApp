
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

        if (typeof password !== "string" || password.length < 6) {
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

        // Step 4: Create user
        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Step 5: Success response
        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
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
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    register,
    login
};
