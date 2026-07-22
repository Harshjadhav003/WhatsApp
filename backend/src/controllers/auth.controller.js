const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// ==========================
// Register Controller
// ==========================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Step 1: Validate Input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Step 2: Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Step 3: Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 4: Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Step 5: Success Response
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ==========================
// Login Controller
// ==========================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Validate Input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        // Step 2: Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // Step 3: Compare Password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // Step 4: Login Success
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

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