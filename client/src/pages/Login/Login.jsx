import React, { useState } from "react";
import PageMeta from "../../components/PageMeta";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { ArrowLeft } from "lucide-react";
import "./module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password });
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (error) {
      console.error("Auth failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="login-page">
      {/* Back button */}
      <button className="login-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>

      <PageMeta 
        title={isRegister ? "Create Account" : "Sign In"} 
        description={
          isRegister 
            ? "Create a Kamigami account to enjoy exclusive access to limited-edition streetwear drops, track your order history, and save your preferred delivery addresses."
            : "Sign in to your Kamigami account to manage your profile details, track recent orders, view saved wishlist items, and update your personal shipping addresses."
        } 
      />
      <div className="login-card">
        {/* Logo */}
        <h1 className="logo-text">KAMIGAMI</h1>

        {/* Title */}
        <h2 className="login-title">{isRegister ? "Create Account" : "Sign in"}</h2>

        <p className="login-subtext">
          {isRegister ? "Join us today" : "Sign in to your account"}
        </p>

        {/* Google Button */}
        <div className="google-btn-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log("Login Failed");
            }}
            useOneTap
            width="100%"
          />
        </div>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email address"
            className="phone-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="phone-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {/* Continue Button */}
          <button type="submit" className="continue-btn" disabled={loading}>
            {loading ? "Processing..." : isRegister ? "Sign up" : "Continue"}
          </button>
        </form>

        <p className="toggle-auth" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </p>

        {/* Terms */}
        <p className="terms-text">
          By continuing, you agree to our <span>Terms of service</span>
        </p>
      </div>

      {/* Footer */}
      <p className="privacy-text">Privacy policy</p>
    </div>
  );
};

export default Login;
