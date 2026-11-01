const express = require("express");

const {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    requestPhoneOtp,
    verifyPhoneOtp,
    getCurrentUser,
    requestPhoneLoginOtp,
    verifyPhoneLoginOtp,
    firebasePhoneLogin,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/me", authMiddleware, getCurrentUser);
// Phone number verification requires login
router.post("/phone/request-otp", authMiddleware, requestPhoneOtp);
router.post("/phone/verify-otp", authMiddleware, verifyPhoneOtp);
router.post("/resend-verification", resendVerificationEmail);

// Public phone login using OTP
router.post("/phone-login/request-otp", requestPhoneLoginOtp);
router.post("/phone-login/verify-otp", verifyPhoneLoginOtp);
router.post("/firebase-phone-login", firebasePhoneLogin);

module.exports = router;
