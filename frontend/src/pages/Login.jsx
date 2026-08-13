import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  // =========================
  // LOGIN STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // REGISTER STATE
  // =========================

  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState("CUSTOMER");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email.trim(),
          password: password,
        }
      );

      console.log("Logged in user:", response.data);

      onLogin(response.data);

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        alert(
          typeof error.response.data === "string"
            ? error.response.data
            : "Invalid email or password."
        );
      } else {
        alert(
          "Cannot connect to backend. Make sure Spring Boot is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE ACCOUNT
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !registerName ||
      !registerEmail ||
      !registerPassword ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (registerPassword.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        fullName: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        role: selectedRole,
      };

      console.log("Creating account:", userData);

      const response = await axios.post(
        "http://localhost:8080/api/users",
        userData
      );

      console.log("Account created:", response.data);

      alert(
        `${selectedRole === "SELLER" ? "Seller" : "Customer"} account created successfully! Please login.`
      );

      // Clear registration form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");

      // Go back to login
      setIsRegistering(false);

      // Keep selected role
      setSelectedRole("CUSTOMER");

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );

        if (error.response.status === 409) {
          alert("Email already exists. Please use another email.");
        } else {
          alert(
            typeof error.response.data === "string"
              ? error.response.data
              : "Failed to create account."
          );
        }
      } else {
        alert(
          "Cannot connect to backend. Make sure Spring Boot is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OPEN CUSTOMER REGISTER
  // =========================

  const openCustomerRegister = () => {
    setSelectedRole("CUSTOMER");
    setIsRegistering(true);
  };

  // =========================
  // OPEN SELLER REGISTER
  // =========================

  const openSellerRegister = () => {
    setSelectedRole("SELLER");
    setIsRegistering(true);
  };

  // =========================
  // BACK TO LOGIN
  // =========================

  const backToLogin = () => {
    setIsRegistering(false);

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="login-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="login-left">

        <div className="brand">
          <div className="brand-icon">
            CK
          </div>

          <span>
            Campus<span>Kart</span>
          </span>
        </div>

        <div className="login-hero">

          <p className="login-tag">
            YOUR CAMPUS MARKETPLACE
          </p>

          <h1>
            Everything you need,
            <br />
            <span>right on campus.</span>
          </h1>

          <p>
            Buy from campus sellers, discover great
            products, and get everything you need
            without leaving campus.
          </p>

          <div className="features">

            <div className="feature">
              <div>01</div>
              <span>Easy Shopping</span>
            </div>

            <div className="feature">
              <div>02</div>
              <span>Quick Orders</span>
            </div>

            <div className="feature">
              <div>03</div>
              <span>Campus Sellers</span>
            </div>

          </div>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="login-right">

        <div className="login-card">

          {/* =========================
              REGISTER PAGE
          ========================= */}

          {isRegistering ? (

            <>
              <div className="welcome-icon">
                {selectedRole === "SELLER" ? "🏪" : "👤"}
              </div>

              <h2>
                Create Account
              </h2>

              <p className="login-subtitle">
                Join CampusKart as a{" "}
                <strong>
                  {selectedRole === "SELLER"
                    ? "Seller"
                    : "Customer"}
                </strong>
              </p>

              {/* ROLE DISPLAY */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRole("CUSTOMER")
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      selectedRole === "CUSTOMER"
                        ? "2px solid #111827"
                        : "1px solid #ddd",
                    background:
                      selectedRole === "CUSTOMER"
                        ? "#111827"
                        : "white",
                    color:
                      selectedRole === "CUSTOMER"
                        ? "white"
                        : "#111827",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  👤 Customer
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRole("SELLER")
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      selectedRole === "SELLER"
                        ? "2px solid #111827"
                        : "1px solid #ddd",
                    background:
                      selectedRole === "SELLER"
                        ? "#111827"
                        : "white",
                    color:
                      selectedRole === "SELLER"
                        ? "white"
                        : "#111827",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🏪 Seller
                </button>

              </div>

              <form onSubmit={handleRegister}>

                {/* NAME */}

                <div className="input-group">

                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={registerName}
                    onChange={(e) =>
                      setRegisterName(e.target.value)
                    }
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="input-group">

                  <label>Email Address</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(e) =>
                      setRegisterEmail(e.target.value)
                    }
                    required
                  />

                </div>

                {/* PASSWORD */}

                <div className="input-group">

                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={registerPassword}
                    onChange={(e) =>
                      setRegisterPassword(e.target.value)
                    }
                    required
                  />

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="input-group">

                  <label>Confirm Password</label>

                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />

                </div>

                {/* CREATE BUTTON */}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}

                  {!loading && (
                    <span>→</span>
                  )}
                </button>

              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <p className="register-text">

                Already have an account?

                <button
                  type="button"
                  onClick={backToLogin}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#111827",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                >
                  Login
                </button>

              </p>

            </>

          ) : (

            /* =========================
               LOGIN PAGE
            ========================= */

            <>

              <div className="welcome-icon">
                CK
              </div>

              <h2>
                Welcome back!
              </h2>

              <p className="login-subtitle">
                Login to continue to CampusKart
              </p>

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="input-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                </div>

                {/* PASSWORD */}

                <div className="input-group">

                  <div className="password-label">

                    <label>
                      Password
                    </label>

                    <a href="#forgot">
                      Forgot password?
                    </a>

                  </div>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login to CampusKart"}

                  {!loading && (
                    <span>→</span>
                  )}
                </button>

              </form>

              <div className="divider">
                <span>or</span>
              </div>

              {/* CREATE CUSTOMER */}

              <p className="register-text">

                Don't have an account?

                <button
                  type="button"
                  onClick={openCustomerRegister}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#111827",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                >
                  Create Customer Account
                </button>

              </p>

              {/* CREATE SELLER */}

              <p
                className="register-text"
                style={{
                  marginTop: "10px",
                }}
              >

                Want to sell on CampusKart?

                <button
                  type="button"
                  onClick={openSellerRegister}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#111827",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                >
                  Create Seller Account
                </button>

              </p>

              {/* ADMIN NOTE */}

              <p
                style={{
                  marginTop: "20px",
                  fontSize: "12px",
                  color: "#777",
                  textAlign: "center",
                }}
              >
                🔐 Admin accounts are managed securely
                by the CampusKart administrator.
              </p>

              <p className="demo-text">
                MVP Demo - CampusKart 2026
              </p>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default Login;