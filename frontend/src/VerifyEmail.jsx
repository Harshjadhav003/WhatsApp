
import { useEffect, useState } from "react";
import api from "./services/api";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage(
          "The verification link is incomplete. Please open the link from your email."
        );
        return;
      }

      try {
        const response = await api.get("/auth/verify-email", {
          params: { token, email },
        });

        if (cancelled) return;

        setStatus("success");
        setMessage(
          response.data.message || "Email verified successfully. You can now log in."
        );
      } catch (error) {
        if (cancelled) return;

        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. The link may have expired."
        );
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="verification-page">
      <section className="verification-card">
        <h1>Email Verification</h1>

        {status === "loading" && <p>{message}</p>}

        {status === "success" && (
          <>
            <p className="verification-success">{message}</p>
            <a className="verification-button" href="/">
              Continue to Login
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <p className="verification-error">{message}</p>
            <a className="verification-button" href="/">
              Back to Login
            </a>
          </>
        )}
      </section>
    </main>
  );
}
