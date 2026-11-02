import { useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./firebase";
import api from "./services/api";
import "./AuthScreen.css";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState("");
  const recaptchaVerifier = useRef(null);
  const confirmationResult = useRef(null);

  function setupRecaptcha() {
  if (recaptchaVerifier.current) {
    return recaptchaVerifier.current;
  }

  recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {
      console.log("reCAPTCHA solved");
    },
    "expired-callback": () => {
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
      setError("reCAPTCHA expired. Please try again.");
    },
  });

  return recaptchaVerifier.current;
}

async function handleRequestPhoneOtp(event) {
  event.preventDefault();
  setError("");
  setOtpFeedback("");

  const mobile = phoneNumber.trim();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    setError("Enter a valid 10-digit Indian mobile number.");
    return;
  }

  setLoading(true);

  try {
    const appVerifier = setupRecaptcha();

    const result = await signInWithPhoneNumber(
      auth,
      `+91${mobile}`,
      appVerifier
    );

    confirmationResult.current = result;

    setOtpSent(true);
    setOtp("");
    setOtpFeedback("OTP sent. Enter your Firebase test code.");
  } catch (err) {
    console.error("Firebase OTP request error:", err);

    recaptchaVerifier.current?.clear();
    recaptchaVerifier.current = null;

    setError(
      err.message || "Could not request OTP. Please try again."
    );
  } finally {
    setLoading(false);
  }
}
async function handleVerifyPhoneOtp(event) {
  event.preventDefault();
  setError("");

  if (!/^\d{6}$/.test(otp.trim())) {
    setError("Enter a valid 6-digit OTP.");
    return;
  }

  if (!confirmationResult.current) {
    setError("Please request an OTP first.");
    return;
  }

  setLoading(true);

 try {
    const result = await confirmationResult.current.confirm(otp.trim());

    const firebaseIdToken = await result.user.getIdToken();

    const response = await api.post("/auth/firebase-phone-login", {
        idToken: firebaseIdToken
    });

    localStorage.setItem("token", response.data.token);

    onLogin(response.data.token);
    // Backend authentication will be connected in the next step.
  } catch (err) {
    console.error("Firebase OTP verification error:", err);

    setError(
      err.message || "OTP verification failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (mode === "register" && name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });

        setMode("login");
        setPassword("");
        setError("Account created! Please log in.");
        return;
      }

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = response.data.token;

      if (!token) {
        throw new Error("Login response did not contain a token.");
      }

      localStorage.setItem("token", token);
      onLogin(token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResendFeedback("");

    if (!email.trim()) {
      setResendFeedback("Please enter your email address first.");
      return;
    }

    setResendLoading(true);

    try {
      const response = await api.post("/auth/resend-verification", {
        email: email.trim(),
      });

      setResendFeedback(
        response.data.message ||
          "If your account needs verification, instructions will be sent."
      );
    } catch (err) {
      setResendFeedback(
        err.response?.data?.message ||
          "Could not process the request. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  }

  
return (
  <main className="auth-page">
    <form
      className="auth-card"
      onSubmit={
        mode === "login" && loginMethod === "phone"
          ? otpSent
            ? handleVerifyPhoneOtp
            : handleRequestPhoneOtp
          : handleSubmit
      }
    >
      <div className="auth-brand">WhatsApp</div>

      <h1>
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>

      <p>Connect with your people.</p>

      {mode === "login" && (
        <div className="login-method-toggle">
          <button
            type="button"
            className={loginMethod === "email" ? "auth-method active" : "auth-method"}
            onClick={() => {
              setLoginMethod("email");
              setOtpSent(false);
              setOtp("");
              setError("");
            }}
          >
            Email Login
          </button>

          <button
            type="button"
            className={loginMethod === "phone" ? "auth-method active" : "auth-method"}
            onClick={() => {
              setLoginMethod("phone");
              setOtpSent(false);
              setOtp("");
              setError("");
            }}
          >
            Phone Login
          </button>
        </div>
      )}

      {mode === "register" && (
        <label>
          Full name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>
      )}

      {(mode === "register" || loginMethod === "email") && (
        <>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setResendFeedback("");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={6}
              required
            />
          </label>
        </>
      )}

      {mode === "login" && loginMethod === "phone" && (
  <>
    <div id="recaptcha-container"></div>

    <label>
      Mobile number
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setOtpSent(false);
                setOtp("");
                setOtpFeedback("");
              }}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              required
            />
          </label>

          {otpSent && (
            <label>
              Enter 6-digit OTP
              <input
                type="text"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
              />
            </label>
          )}

          {otpFeedback && (
            <p className="auth-info" role="status">
              {otpFeedback}
            </p>
          )}

          {otpSent && (
            <button
              type="button"
              className="auth-switch"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setOtpFeedback("");
                setError("");
              }}
            >
              Change phone number
            </button>
          )}
        </>
      )}

      {error && (
        <p className="auth-feedback" role="alert">
          {error}
        </p>
      )}

      <button className="auth-submit" type="submit" disabled={loading}>
        {loading
          ? "Please wait..."
          : mode === "register"
            ? "Create account"
            : loginMethod === "phone"
              ? otpSent
                ? "Verify OTP"
                : "Request OTP"
              : "Log in"}
      </button>

      {mode === "login" && loginMethod === "email" && (
        <div className="resend-verification">
          <button
            className="auth-switch"
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
          >
            {resendLoading
              ? "Sending..."
              : "Resend verification email"}
          </button>

          {resendFeedback && (
            <p className="auth-feedback" role="status">
              {resendFeedback}
            </p>
          )}
        </div>
      )}

      <button
        className="auth-switch"
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setLoginMethod("email");
          setOtpSent(false);
          setOtp("");
          setError("");
          setResendFeedback("");
          setOtpFeedback("");
        }}
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already registered? Log in"}
      </button>
    </form>
  </main>
);

}
