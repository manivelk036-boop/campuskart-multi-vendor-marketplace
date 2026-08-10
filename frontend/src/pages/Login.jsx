import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email,
          password: password,
        }
      );

      console.log("Logged in user:", response.data);

      // Send actual logged-in user to App.jsx
      onLogin(response.data);

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert(
          "Cannot connect to backend. Make sure Spring Boot is running."
        );
      }
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">

        <div className="brand">
          <div className="brand-icon">CK</div>

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
            Buy from campus sellers, discover great products,
            and get everything you need without leaving campus.
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

      {/* RIGHT SIDE */}

      <div className="login-right">

        <div className="login-card">

          <div className="welcome-icon">
            CK
          </div>

          <h2>Welcome back!</h2>

          <p className="login-subtitle">
            Login to continue to CampusKart
          </p>

          <form onSubmit={handleLogin}>

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <div className="input-group">

              <div className="password-label">

                <label>Password</label>

                <a href="#forgot">
                  Forgot password?
                </a>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>

            <button
              type="submit"
              className="login-button"
            >
              Login to CampusKart
              <span>→</span>
            </button>

          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <strong> Create Account</strong>
          </p>

          <p className="demo-text">
            MVP Demo - CampusKart 2026
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;