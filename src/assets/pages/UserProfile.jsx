import React, { useEffect, useState } from "react";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (sessionUser) setUser(sessionUser);
  }, []);

  if (!user) return <div className="loader">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <img
            src={"."}
            alt={user.username}
            className="profile-avatar"
          />
          <h2 className="profile-name">
            {user.username} {user.verified && <span className="green-tick">✔️</span>}
          </h2>
          {user.role === "vendor" && (
            <span className={`vendor-badge ${user.verified ? "verified" : "pending"}`}>
              {user.verified ? "Verified Vendor" : "Pending Verification"}
            </span>
          )}
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <h3>Account Info</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="edit-btn">Edit Profile</button>
          {user.role === "vendor" && (
            <button className="add-product-btn">Add Product</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
