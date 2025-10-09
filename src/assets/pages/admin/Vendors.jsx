import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Vendors.css";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/vendors", // deployed
      "http://localhost:5000/api/admin/vendors",                // local fallback
    ];

    const token = localStorage.getItem("token");
    let fetchedData = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedData = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err.message);
      }
    }

    setVendors(fetchedData);
    setLoading(false);
  };

  const toggleVerify = async (id, currentStatus) => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/verify-vendor/",
      "http://localhost:5000/api/admin/verify-vendor/",
    ];

    const token = localStorage.getItem("token");

    for (let url of urls) {
      try {
        const res = await axios.put(
          `${url}${id}`,
          { verified: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVendors((prev) =>
          prev.map((vendor) =>
            vendor._id === id ? { ...vendor, verified: !currentStatus } : vendor
          )
        );

        alert(res.data.message || "Vendor status updated");
        break;
      } catch (err) {
        console.warn(`Failed to update vendor at ${url}:`, err.message);
      }
    }
  };

  if (loading) return <div className="loader">Loading vendors...</div>;

  return (
    <div className="vendors-page">
      <h1>Vendors Management 🏪</h1>
      <p>View all vendor accounts and manage verification status.</p>

      <div className="vendors-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="4">No vendors found</td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.username}</td>
                  <td>{vendor.email}</td>
                  <td>
                    <span
                      className={`status ${
                        vendor.verified ? "verified" : "unverified"
                      }`}
                    >
                      {vendor.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`verify-btn ${
                        vendor.verified ? "unverify" : "verify"
                      }`}
                      onClick={() => toggleVerify(vendor._id, vendor.verified)}
                    >
                      {vendor.verified ? "Unverify" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vendors;
