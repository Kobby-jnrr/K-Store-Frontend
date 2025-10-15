import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./PromoBoard.css";

function PromoBoard() {
  const [vendors, setVendors] = useState([]);
  const [activePromoIds, setActivePromoIds] = useState([]);
  const [promoDurations, setPromoDurations] = useState({});
  const [loading, setLoading] = useState(true);

  const API_BASES = [
    "https://k-store-backend.onrender.com/api/admin",
    "http://localhost:5000/api/admin",
  ];
  const PROMO_API_BASES = [
    "https://k-store-backend.onrender.com/api",
    "http://localhost:5000/api",
  ];

  // Fetch vendors and current promo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      try {
        // Fetch vendors
        const vendorRes = await Promise.any(
          API_BASES.map(base =>
            axios.get(`${base}/vendors`, { headers: { Authorization: `Bearer ${token}` } })
          )
        );
        setVendors(vendorRes.data);

        // Fetch active promo
        const promoRes = await Promise.any(
          PROMO_API_BASES.map(base =>
            axios.get(`${base}/promo`, { headers: { Authorization: `Bearer ${token}` } })
          )
        );

        const activeIds = promoRes.data.vendorIds || [];
        setActivePromoIds(activeIds);

        // Set default durations
        const durations = {};
        activeIds.forEach(id => (durations[id] = promoRes.data.durationWeeks || 2));
        setPromoDurations(durations);
      } catch (err) {
        console.error("Failed to fetch vendors or promo:", err);
        toast.error("Failed to fetch vendors or promo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDurationChange = (vendorId, weeks) => {
    setPromoDurations(prev => ({ ...prev, [vendorId]: weeks }));
  };

  const togglePromo = async (vendorId) => {
    const token = sessionStorage.getItem("token");
    const isActive = activePromoIds.includes(vendorId);

    // Determine new promo array
    const updatedIds = isActive
      ? activePromoIds.filter(id => id !== vendorId)
      : [...activePromoIds, vendorId];

    // Prepare payload conditionally
    const payload = isActive
      ? { vendorIds: updatedIds } // removing vendor
      : { vendorIds: updatedIds, durationWeeks: promoDurations[vendorId] || 2 }; // activating vendor

    try {
      await Promise.any(
        PROMO_API_BASES.map(base =>
          axios.post(`${base}/promo`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setActivePromoIds(updatedIds);
      toast.success(isActive ? "Promo removed ✅" : "Promo activated 🎉");

      // Refresh promo banner in Main.jsx
      window.dispatchEvent(new Event("promoUpdated"));
    } catch (err) {
      console.error("Error toggling promo:", err);
      toast.error(err.response?.data?.message || "Failed to update promo");
    }
  };

  if (loading) return <div className="loader">Loading vendors...</div>;

  return (
    <div className="promo-board-page">
      <Toaster />
      <h1>Promo Management 🎁</h1>
      <p>Activate or remove promo banners for vendors with duration 1–4 weeks.</p>

      <div className="vendors-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Duration (weeks)</th>
              <th>Promo Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr><td colSpan="5">No vendors found</td></tr>
            ) : (
              vendors.map(vendor => {
                const isActive = activePromoIds.includes(vendor._id);
                return (
                  <tr key={vendor._id}>
                    <td>{vendor.username}</td>
                    <td>{vendor.email}</td>
                    <td>
                      <select
                        value={promoDurations[vendor._id] || 2}
                        onChange={e => handleDurationChange(vendor._id, +e.target.value)}
                        disabled={isActive}
                      >
                        {[1, 2, 3, 4].map(week => (
                          <option key={week} value={week}>{week}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`status ${isActive ? "active" : "inactive"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`promo-btn ${isActive ? "remove" : "activate"}`}
                        onClick={() => togglePromo(vendor._id)}
                      >
                        {isActive ? "Remove Promo" : "Activate Promo"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromoBoard;
