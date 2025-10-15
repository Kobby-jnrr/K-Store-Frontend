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
      let fetchedVendors = [];
      let promoVendorIds = [];

      // Fetch vendors
      for (let url of [`${API_BASES[0]}/vendors`, `${API_BASES[1]}/vendors`]) {
        try {
          const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          fetchedVendors = Array.isArray(res.data) ? res.data : [];
          break;
        } catch (err) {
          console.warn(`Failed to fetch vendors from ${url}:`, err.message);
        }
      }

      // Fetch current promo
      for (let url of [`${API_BASES[0]}/promo`, `${API_BASES[1]}/promo`]) {
        try {
          const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          promoVendorIds = res.data.vendorIds || [];
          break;
        } catch (err) {
          console.warn(`Failed to fetch promo from ${url}:`, err.message);
        }
      }

      setVendors(fetchedVendors);
      setActivePromoIds(promoVendorIds);
      setLoading(false);
    };

    fetchData();
  }, []);

  const togglePromo = async (vendorId) => {
    const token = sessionStorage.getItem("token");
    const promoDurationDays = 14;

    let updatedIds = [...activePromoIds];
    const isActive = updatedIds.includes(vendorId);

    if (isActive) {
      // Remove vendor from active promo
      updatedIds = updatedIds.filter(id => id !== vendorId);
    } else {
      // Add vendor to promo
      updatedIds.push(vendorId);
    }

    // Create new promo
    const payload = {
      vendorIds: updatedIds,
      durationHours: promoDurationDays * 24,
    };

    try {
      for (let base of API_BASES) {
        try {
          await axios.post(`${base}/promo`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        } catch (err) {
          console.warn(`Failed to POST promo at ${base}:`, err.message);
        }
      }

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
