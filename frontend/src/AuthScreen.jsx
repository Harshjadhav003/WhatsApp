
import { useState } from "react";
import api from "./services/api";
import "./AuthScreen.css";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">WhatsApp</div>
       <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>Connect with your people.</p>

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

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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

        {error && (
          <p className="auth-feedback" role="status">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
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
