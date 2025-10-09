import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", price: "", description: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products with fallback URLs
  const fetchProducts = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/products",
      "http://localhost:5000/api/admin/products",
    ];

    const token = sessionStorage.getItem("token"); // ✅ use sessionStorage
    let fetchedProducts = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedProducts = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch products from ${url}:`, err.message);
      }
    }

    setProducts(fetchedProducts);
    setLoading(false);
  };

  // Start editing a product
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      title: product.title,
      price: product.price,
      description: product.description,
    });
  };

  // Save edited product
  const handleSave = async (id) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/products/${id}`,
      `http://localhost:5000/api/admin/products/${id}`,
    ];
    const token = sessionStorage.getItem("token"); // ✅ use sessionStorage

    for (let url of urls) {
      try {
        await axios.put(url, editData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
        fetchProducts();
        break;
      } catch (err) {
        console.warn(`Failed to update product at ${url}:`, err.message);
      }
    }
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const urls = [
      `https://k-store-backend.onrender.com/api/admin/products/${id}`,
      `http://localhost:5000/api/admin/products/${id}`,
    ];
    const token = sessionStorage.getItem("token"); // ✅ use sessionStorage

    for (let url of urls) {
      try {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
        break;
      } catch (err) {
        console.warn(`Failed to delete product at ${url}:`, err.message);
      }
    }
  };

  if (loading) return <div className="loader">Loading products...</div>;

  return (
    <div className="products-page">
      <h1>Products Management 📦</h1>
      <p>Manage all products listed by vendors.</p>

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
            {products.length === 0 ? (
              <tr>
                <td colSpan="5">No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {editingId === product._id ? (
                      <input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    ) : (
                      product.title
                    )}
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) =>
                          setEditData({ ...editData, price: e.target.value })
                        }
                      />
                    ) : (
                      `$${product.price}`
                    )}
                  </td>
                  <td>
                    {editingId === product._id ? (
                      <input
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                      />
                    ) : (
                      product.description
                    )}
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
