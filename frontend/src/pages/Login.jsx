import { useEffect, useState } from "react";
import apiClient, { AUTH_STORAGE_KEY } from "../apiClient";

function Login({ onLogin }) {
  // =========================
  // LOGIN STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);

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

  const apiErrorMessage = (error) => {
    if (error?.response?.data) {
      if (typeof error.response.data === "string") {
        return error.response.data;
      }

      if (error.response.data.message) {
        return error.response.data.message;
      }
    }

    return "Unable to reach the CampusKart backend. Please try again.";
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setLoginMessage("");

      const response = await apiClient.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password: password,
        }
      );

      if (response.data?.requiresOtp) {
        setIsOtpStep(true);
        setOtp("");
        setOtpSecondsRemaining(5 * 60);
        setLoginMessage(
          response.data.message ||
            "OTP sent successfully. Please verify the code."
        );
        return;
      }

      setErrorMessage("Unexpected login response from the backend.");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(apiErrorMessage(error));
      setIsOtpStep(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();

    if (otpSecondsRemaining <= 0) {
      setErrorMessage("OTP expired. Please request a fresh code.");
      return;
    }

    if (!otp || otp.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setLoginMessage("");

      const response = await apiClient.post(
        "/otp/verify",
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }
      );

      if (!response.data?.token) {
        throw new Error("OTP verification did not include a JWT.");
      }

      const user = {
        token: response.data.token,
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
      };

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(user)
      );

      onLogin(user);
    } catch (error) {
      console.error("OTP verification error:", error);
      setErrorMessage(
        apiErrorMessage(error).replace("Invalid or expired OTP", "Invalid or expired OTP. Please request a fresh code.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password first.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setOtp("");

      const response = await apiClient.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password: password,
        }
      );

      if (response.data?.requiresOtp) {
        setIsOtpStep(true);
        setOtpSecondsRemaining(5 * 60);
        setLoginMessage(
          response.data.message ||
            "A fresh OTP has been sent. Please verify the code."
        );
        return;
      }

      setErrorMessage("Unable to resend OTP right now.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrorMessage(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOtpStep || otpSecondsRemaining <= 0) return undefined;

    const timer = window.setInterval(() => {
      setOtpSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOtpStep, otpSecondsRemaining]);

  const formattedOtpTime = `${String(Math.floor(otpSecondsRemaining / 60)).padStart(2, "0")}:${String(otpSecondsRemaining % 60).padStart(2, "0")}`;

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

      const response = await apiClient.post(
        "/users",
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

        <div className="login-hero-nav" aria-label="CampusKart marketplace links">
          <span>SHOP</span>
          <span>SELL</span>
          <span>CONNECT</span>
        </div>

        <div className="login-hero">

          <p className="login-tag">
            YOUR CAMPUS MARKETPLACE
          </p>

          <h1>
            Everything
            <br />
            you need,
            <br />
            <span>right on campus.</span>
          </h1>

          <p>
            Buy from verified campus sellers, discover great products, and get
            everything you need without leaving campus.
          </p>

          <div className="features">

            <div className="feature">
              <div className="feature-icon" aria-hidden="true">🛒</div>
              <span>Easy Shopping</span>
            </div>

            <div className="feature">
              <div className="feature-icon" aria-hidden="true">⚡</div>
              <span>Quick Orders</span>
            </div>

            <div className="feature">
              <div className="feature-icon" aria-hidden="true">👥</div>
              <span>Campus Sellers</span>
            </div>

          </div>

          <p className="login-community-note">Students support students.</p>

          <div className="floating-products" aria-hidden="true">
            <div className="floating-product floating-product-headphones">
              <div className="floating-product-art headphones-art">◖◗</div>
              <div className="floating-product-copy">
                <strong>Headphones</strong>
                <span>₹1,299</span>
              </div>
              <span className="floating-product-action">♡</span>
            </div>

            <div className="floating-product floating-product-hoodie">
              <div className="floating-product-art hoodie-art">◆</div>
              <div className="floating-product-copy">
                <strong>Campus Hoodie</strong>
                <span>₹799</span>
              </div>
              <span className="floating-product-action">♡</span>
            </div>

            <div className="floating-product floating-product-study">
              <div className="floating-product-art study-art">✦</div>
              <div className="floating-product-copy">
                <strong>Study Essentials</strong>
                <span>₹499</span>
              </div>
              <span className="floating-product-action">＋</span>
            </div>
          </div>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="login-right">

        <p className="login-right-eyebrow">A SMARTER CAMPUS. TOGETHER.</p>

        <div className="login-card-decorations" aria-hidden="true">
          <span className="login-decoration login-decoration-cart">🛒</span>
          <span className="login-decoration login-decoration-heart">♡</span>
          <span className="login-decoration login-decoration-cap">✦</span>
          <span className="login-decoration login-decoration-community">Campus Community</span>
        </div>

        <div className="login-card">

          <div className="login-card-brand">
            <span className="login-card-brand-mark">CK</span>
            <strong>Campus<span>Kart</span></strong>
          </div>

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
                className="login-role-toggle"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >

                <button
                  className="login-role-button"
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
                  className="login-role-button"
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
                  className="login-link-button"
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

              {isOtpStep ? (
                <form onSubmit={handleOtpVerify}>
                  <div className="welcome-icon">
                    CK
                  </div>

                  <h2>
                    Enter OTP
                  </h2>

                  <p className="login-subtitle">
                    Verification code sent to {email}
                  </p>

                  {loginMessage && (
                    <div className="login-message">
                      {loginMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="login-error">
                      {errorMessage}
                    </div>
                  )}

                  <p className={`otp-countdown ${otpSecondsRemaining === 0 ? "expired" : ""}`}>
                    {otpSecondsRemaining === 0 ? "OTP expired" : `OTP expires in ${formattedOtpTime}`}
                  </p>

                  <div className="input-group">
                    <label>
                      OTP Code
                    </label>

                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      inputMode="numeric"
                      maxLength="6"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading || otpSecondsRemaining === 0}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                    {!loading && <span>→</span>}
                  </button>

                  <button
                    type="button"
                    className="login-button login-secondary-button"
                    disabled={loading}
                    onClick={handleResendOtp}
                    style={{ marginTop: "10px" }}
                  >
                    {loading ? "Sending..." : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    className="login-button login-secondary-button"
                    disabled={loading}
                    onClick={() => {
                      setIsOtpStep(false);
                      setOtp("");
                      setLoginMessage("");
                      setErrorMessage("");
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    Back to login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin}>

                  {/* EMAIL */}

                  <div className="input-group login-email-group">

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

                  <div className="input-group login-password-group">

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

                  {errorMessage && (
                    <div className="login-error">
                      {errorMessage}
                    </div>
                  )}

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
              )}

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