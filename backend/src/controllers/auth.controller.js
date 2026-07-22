const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
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

    // Step 3: User does not exist
    const hashedPassword = await bcrypt.hash(password, 10);
 
   const user = await User.create({
        name ,
        email,
         password:hashedPassword
    });

    return res.status(200).json({
        success:true,
        message:"User Registered Successfully",
        user 
    })
};

const login = async (req, res) => {
    const {email , password} = req.body;

      if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"Email and password are required" 
        });
      }

      const user = await User.findOne({ email });

      if(!user){
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        });
        
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if(!isPasswordMatch){
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
      };

      const userResponse = {
        _id:user._id,
        name: user.name,
        email:user.email,
      };
   
      return res.status(201).json({
      success: true,
      message: "Login successful",
      user: userResponse,
    });
};

module.exports = {
    register,
    login
};