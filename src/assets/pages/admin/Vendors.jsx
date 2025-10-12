import React, { useEffect, useState } from "react"; 
import axios from "axios";
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
    const token = sessionStorage.getItem("token");

    // Fetch vendors
    const vendorUrls = [
      "https://k-store-backend.onrender.com/api/admin/vendors",
      "http://localhost:5000/api/admin/vendors",
    ];

    // Fetch orders
    const orderUrls = [
      "https://k-store-backend.onrender.com/api/admin/orders",
      "http://localhost:5000/api/admin/orders",
    ];

    let fetchedVendors = [];
    let fetchedOrders = [];

    for (let url of vendorUrls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchedVendors = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch vendors from ${url}:`, err.message);
      }
    }

    for (let url of orderUrls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchedOrders = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch orders from ${url}:`, err.message);
      }
    }

    setOrders(fetchedOrders);

    // Compute revenue per vendor
    const revenueMap = {};
    fetchedOrders.forEach(order => {
      order.items.forEach(item => {
        const vendorId = item.vendor?._id;
        if (!vendorId) return;
        if (!revenueMap[vendorId]) revenueMap[vendorId] = 0;
        revenueMap[vendorId] += item.total || (item.quantity * (item.product?.price || 0));
      });
    });

    const vendorsWithRevenue = fetchedVendors
      .map(v => ({
        ...v,
        totalRevenue: revenueMap[v._id] || 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    setVendors(vendorsWithRevenue);
    setLoading(false);
  };

  const toggleVerify = async (id, currentStatus) => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/verify-vendor/",
      "http://localhost:5000/api/admin/verify-vendor/",
    ];

    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        const res = await axios.put(
          `${url}${id}`,
          { verified: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVendors(prev =>
          prev.map(v => (v._id === id ? { ...v, verified: !currentStatus } : v))
        );

        // Show toast instead of alert
        toast.success(!currentStatus ? "Verified ✅" : "Unverified ❌", {
          duration: 3000,
          position: "top-right",
        });

        break;
      } catch (err) {
        console.warn(`Failed to update vendor at ${url}:`, err.message);
        toast.error("Failed to update vendor status", { duration: 3000 });
      }
    }
  };

  if (loading) return <div className="loader">Loading vendors...</div>;

  // Apply search and filter
  const filteredVendors = vendors.filter(vendor => {
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
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
              filteredVendors.map(vendor => (
                <tr key={vendor._id}>
                  <td>{vendor.username}</td>
                  <td>{vendor.email}</td>
                  <td>GH₵{vendor.totalRevenue.toFixed(2)}</td>
                  <td>
                    <span className={`status ${vendor.verified ? "verified" : "unverified"}`}>
                      {vendor.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`verify-btn ${vendor.verified ? "unverify" : "verify"}`}
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
