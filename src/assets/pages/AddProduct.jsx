import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../api/productService";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

const VendorAddProduct = () => {
  const navigate = useNavigate();

  // -----------------------------
  // Product form state
  // -----------------------------
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  // -----------------------------
  // Vendor info loaded from sessionStorage
  // -----------------------------
  const [vendor, setVendor] = useState(null);

  // -----------------------------
  // Product categories
  // -----------------------------
  const categories = [
    "fashion",
    "electronics",
    "home",
    "grocery",
    "baby",
    "beauty",
    "sports",
    "gaming",
  ];

  // -----------------------------
  // Load vendor info when component mounts
  // -----------------------------
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || user.role !== "vendor") {
      toast.error("❌ Access Denied! Only vendors can add products.");
      navigate("/");
    } else {
      setVendor(user);
    }
  }, [navigate]);

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.price || !formData.category || !formData.image) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      // Attach vendor info to product data
      await addProduct({
        ...formData,
        vendor: vendor._id,             // backend uses this to link product to vendor
        vendorName: vendor.username,    // frontend can display this directly
        vendorVerified: vendor.verified // show verified tick if applicable
      });

      toast.success("✅ Product added successfully!");

      // Reset form
      setFormData({ title: "", price: "", category: "", description: "", image: "" });
    } catch (err) {
      const message = err.response?.data?.message || "Error adding product";
      toast.error(`❌ ${message}`);
      console.error("Add product error:", err.response || err);
    }
  };

  return (
    <div className="vendor-add-product-container">
      <Toaster position="top-right" />
      {/* Page Heading */}
      <h2 className="addhead">
        ADD A PRODUCT
        {vendor && ( <>
            &nbsp;by {vendor.username}
            {vendor.verified && "✅"}
          </>
        )}
      </h2>
      {/* Product Form */}
      <div className="vendor-form-container">
        <form className="vendor-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <input
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
          />
          <button type="submit" className="add-product-button">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};
export default VendorAddProduct;
