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

function SignUpVendor({ setUser }) {
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
    businessName: "",
    school: "",
    location: "",
    role: "vendor",
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

    if (!form.phone) {
      setError("Phone number is required!");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username:
          form.businessName.trim() !== ""
            ? form.businessName.trim()
            : `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        businessName:
          form.businessName.trim() !== "" ? form.businessName.trim() : null,
        school: form.school,
        location: form.location.trim(),
      };

      const data = await registerUser(userData);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Vendor account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtered dropdown
  const filteredLocations = selectedLocations.filter((loc) =>
    loc.toLowerCase().includes(form.location.toLowerCase())
  );

  const handleLocationSelect = (loc) => {
    setForm({ ...form, location: loc });
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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
        <h1 className="signup-title">Vendor Sign Up</h1>
        <p className="signup-subtitle">
          Create your vendor account and start selling today!
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

          <input
            type="text"
            name="businessName"
            placeholder="Business Name (optional)"
            value={form.businessName}
            onChange={handleChange}
          />
          <p className="field-note">
            If you don’t provide a business name, your full name will be used
            instead.
          </p>
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
            {/*<option value="Kwame Nkrumah University Of Science and Technology">
              Kwame Nkrumah University Of Science and Technology
            </option> */}
          </select>

          <div className="dropdown-container" ref={dropdownRef}>
            <input
              className="location-input"
              type="text"
              name="location"
              placeholder="Location - Hostel Name. Eg. Amamoma, New Site..."
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
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Create Vendor Account"
            )}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="signup-links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
            <p>
              Are you a customer? <Link to="/signup">Click here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpVendor;
