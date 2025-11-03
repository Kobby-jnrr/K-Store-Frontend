import React, { useEffect, useState } from "react";
import API from "../../../api/axios.js";
import toast, { Toaster } from "react-hot-toast";
import "./Vendors.css";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // For search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedVendors, fetchedOrders] = await Promise.all([
        API.get("/admin/vendors").then((res) => res.data),
        API.get("/admin/orders").then((res) => res.data),
      ]);

      setOrders(fetchedOrders);

      // Compute revenue per vendor
      const revenueMap = {};
      fetchedOrders.forEach((order) => {
        order.items.forEach((item) => {
          const vendorId = item.vendor?._id;
          if (!vendorId) return;
          if (!revenueMap[vendorId]) revenueMap[vendorId] = 0;
          revenueMap[vendorId] +=
            item.total || item.quantity * (item.product?.price || 0);
        });
      });

      const vendorsWithRevenue = fetchedVendors
        .map((v) => ({
          ...v,
          totalRevenue: revenueMap[v._id] || 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      setVendors(vendorsWithRevenue);
    } catch (err) {
      console.error("Error fetching vendors or orders:", err);
      toast.error("Failed to load vendors or orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, currentStatus) => {
    try {
      await API.put(`/admin/verify-vendor/${id}`, { verified: !currentStatus });

      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, verified: !currentStatus } : v))
      );

      toast.success(!currentStatus ? "Verified ✅" : "Unverified ❌", {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to update vendor status:", err);
      toast.error("Failed to update vendor status", { duration: 3000 });
    }
  };

  if (loading) return <div className="loader">Loading vendors...</div>;

  // Apply search and filter
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Verified" && vendor.verified) ||
      (statusFilter === "Pending" && !vendor.verified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vendors-page">
      <Toaster />
      <h1>Vendors Management 🏪</h1>
      <p>View all vendor accounts and manage verification status.</p>

      {/* Search & Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="vendors-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Total Revenue</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="5">No vendors found</td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.username}</td>
                  <td>{vendor.email}</td>
                  <td>GH₵{vendor.totalRevenue.toFixed(2)}</td>
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
