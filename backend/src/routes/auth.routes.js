
const express = require("express");

const {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    requestPhoneOtp,
    verifyPhoneOtp,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
// Phone number verification requires login
router.post("/phone/request-otp", authMiddleware, requestPhoneOtp);
router.post("/phone/verify-otp", authMiddleware, verifyPhoneOtp);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
