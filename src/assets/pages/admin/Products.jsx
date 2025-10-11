import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", price: "", description: "" });

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products with fallback URLs
  const fetchProducts = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/products",
      "http://localhost:5000/api/admin/products",
    ];

    const token = sessionStorage.getItem("token");
    let fetchedProducts = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchedProducts = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch products from ${url}:`, err.message);
      }
    }

    setProducts(fetchedProducts);
    setLoading(false);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({ title: product.title, price: product.price, description: product.description });
  };

  const handleSave = async (id) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/products/${id}`,
      `http://localhost:5000/api/admin/products/${id}`,
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.put(url, editData, { headers: { Authorization: `Bearer ${token}` } });
        setEditingId(null);
        fetchProducts();
        break;
      } catch (err) {
        console.warn(`Failed to update product at ${url}:`, err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/products/${id}`,
      `http://localhost:5000/api/admin/products/${id}`,
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchProducts();
        break;
      } catch (err) {
        console.warn(`Failed to delete product at ${url}:`, err.message);
      }
    }
  };

  if (loading) return <div className="loader">Loading products...</div>;

  // Apply search and vendor filter
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.vendor?.username || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVendor =
      vendorFilter === "All" || (product.vendor?.username || "") === vendorFilter;

    return matchesSearch && matchesVendor;
  });

  // Get unique vendor names for filter dropdown
  const vendorNames = Array.from(new Set(products.map(p => p.vendor?.username).filter(Boolean)));

  return (
    <div className="products-page">
      <h1>Products Management 📦</h1>
      <p>Manage all products listed by vendors.</p>

      {/* Search & Vendor Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, description, or vendor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="All">All Vendors</option>
          {vendorNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5">No products found</td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    {editingId === product._id ? (
                      <input
                        value={editData.title}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                      />
                    ) : product.title}
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        type="number"
                        value={editData.price}
                        onChange={e => setEditData({ ...editData, price: e.target.value })}
                      />
                    ) : `$${product.price}`}
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        value={editData.description}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                      />
                    ) : product.description}
                  </td>
                  <td>{product.vendor?.username || "N/A"}</td>
                  <td>
                    {editingId === product._id ? (
                      <>
                        <button onClick={() => handleSave(product._id)}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(product)}>Edit</button>
                        <button onClick={() => handleDelete(product._id)}>Delete</button>
                      </>
                    )}
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

export default Products;
