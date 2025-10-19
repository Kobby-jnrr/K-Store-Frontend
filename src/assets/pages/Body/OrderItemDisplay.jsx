import React from "react";

function OrderItemDisplay({ item }) {
  if (!item) return null;

  // Handle deleted products gracefully
  if (!item.product) {
    return (
      <span style={{ color: "gray", fontStyle: "italic" }}>
        Deleted Product × {item.quantity}
      </span>
    );
  }

  // Normal case
  return (
    <span>
      {item.product.title} × {item.quantity}
    </span>
  );
}

export default OrderItemDisplay;
