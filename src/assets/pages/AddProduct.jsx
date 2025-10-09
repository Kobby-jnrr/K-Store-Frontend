import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../api/productService";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

const VendorAddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: ""
  });

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

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")); // ✅ Use sessionStorage
    if (!user || user.role !== "vendor") {
      toast.error("❌ Access Denied! Only vendors can add products.");
      navigate("/"); 
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !formData.image) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      await addProduct(formData);
      toast.success("✅ Product added!");
      setFormData({ title: "", price: "", category: "", description: "", image: "" });
    } catch (err) {
      const message = err.response?.data?.message || "Error adding product";
      toast.error(`❌ ${message}`);
      console.error("Add product error:", err.response || err);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="addhead">ADD A PRODUCT</h2>
      <div className="vendor-form-container">
        <form className="vendor-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Product name"
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
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default VendorAddProduct;
