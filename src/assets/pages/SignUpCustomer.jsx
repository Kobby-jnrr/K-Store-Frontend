import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpForm.css";
import logo from "../components/Header/head-image/Web-logo.png";
import schoolLocations from "./schoolLocations";
import { registerUser } from "../../api/authService";

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function SignUpCustomer({ setUser }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: "",
    school: "",
    location: "",
    role: "customer",
  });

  const selectedLocations = schoolLocations[form.school] || [];
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password !== form.confirmpassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        school: form.school,
        location: form.location.trim(),
      };

      const data = await registerUser(userData);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter areas by typed value
  const filteredLocations = selectedLocations.filter((loc) =>
    loc.toLowerCase().includes(form.location.toLowerCase())
  );

  const handleLocationSelect = (loc) => {
    setForm({ ...form, location: loc });
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Accept whatever the user typed
      e.preventDefault();
      setShowDropdown(false);
      setForm({ ...form, location: form.location.trim() });
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-bg"></div>

      <div className="signup-card">
        <img src={logo} alt="K-Store Logo" className="signup-logo" />
        <h1 className="signup-title">Customer Sign Up</h1>
        <p className="signup-subtitle">
          Create your customer account and start shopping today!
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-grid">
            <input
              type="text"
              name="firstName"
              placeholder="First Name*"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name*"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email*"
            value={form.email}
            onChange={handleChange}
            required
          />
          <p className="field-note">
            A verification code will be sent within 24 hours.
          </p>

          <input
            type="text"
            name="phone"
            placeholder="Phone Number*"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <select
            name="school"
            value={form.school}
            onChange={handleChange}
            required
            className="school-select"
          >
            <option value="">Select School</option>
            <option value="University of Cape Coast">
              University of Cape Coast
            </option>
            <option value="University of Ghana">University of Ghana</option>
            <option value="Kwame Nkrumah University Of Science and Technology">
              Kwame Nkrumah University Of Science and Technology
            </option>
            <option value="University of Education, Winneba">
              University of Education, Winneba
            </option>
          </select>

          <div className="dropdown-container" ref={dropdownRef}>
            <input
              className="location-input"
              type="text"
              name="location"
              placeholder="Location. Eg. Amamoma, New Site..."
              value={toTitleCase(form.location)}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              required
            />
            {showDropdown && (
              <ul className="dropdown-list">
                {(form.location.trim() === ""
                  ? selectedLocations
                  : filteredLocations
                ).map((loc) => (
                  <li key={loc} onClick={() => handleLocationSelect(loc)}>
                    {toTitleCase(loc)}
                  </li>
                ))}
                {/* If user typed something not found */}
                {form.location.trim() && filteredLocations.length === 0 && (
                  <li className="no-results">
                    Press Enter to add "{form.location}"
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password* (At least 5 characters)"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* 👁️ Confirm Password with toggle */}
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmpassword"
              placeholder="Confirm Password*"
              value={form.confirmpassword}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>
          <button type="submit" disabled={loading} className="signup-button">
            {loading ? <span className="spinner"></span> : "Create Account"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="signup-links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
            <p>
              Are you a vendor? <Link to="/vendor-signup">Click here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpCustomer;
