import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./PromoBoard.css";

function PromoBoard() {
  const [vendors, setVendors] = useState([]);
  const [activePromoIds, setActivePromoIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASES = [
    "https://k-store-backend.onrender.com/api/admin",
    "http://localhost:5000/api/admin",
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
        setVendors(Array.isArray(vendorRes.data) ? vendorRes.data : []);

        // Fetch promo
        const promoRes = await Promise.any(
          API_BASES.map(base =>
            axios.get(`${base}/promo`, { headers: { Authorization: `Bearer ${token}` } })
          )
        );
        setActivePromoIds(promoRes.data.vendorIds || []);
      } catch (err) {
        console.error("Failed to fetch vendors or promo:", err);
        toast.error("Failed to fetch vendors or promo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePromo = async (vendorId) => {
    const token = sessionStorage.getItem("token");
    const promoDurationHours = 14 * 24; // 14 days

    const isActive = activePromoIds.includes(vendorId);
    const updatedIds = isActive
      ? activePromoIds.filter(id => id !== vendorId)
      : [...activePromoIds, vendorId];

    try {
      await Promise.any(
        API_BASES.map(base =>
          axios.post(
            `${base}/promo`,
            { vendorIds: updatedIds, durationHours: promoDurationHours },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setActivePromoIds(updatedIds);
      toast.success(isActive ? "Promo removed ✅" : "Promo activated 🎉", {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error("Error toggling promo:", err);
      toast.error("Failed to update promo", { duration: 3000 });
    }
  };

  if (loading) return <div className="loader">Loading vendors...</div>;

  return (
    <div className="promo-board-page">
      <Toaster />
      <h1>Promo Management 🎁</h1>
      <p>Activate or remove special promo banners for vendors.</p>

      <div className="vendors-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Promo Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="4">No vendors found</td>
              </tr>
            ) : (
              vendors.map(vendor => {
                const isActive = activePromoIds.includes(vendor._id);
                return (
                  <tr key={vendor._id}>
                    <td>{vendor.username}</td>
                    <td>{vendor.email}</td>
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
