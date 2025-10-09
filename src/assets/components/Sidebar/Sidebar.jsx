import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import fashion from "./side-image/fashion.png";
import electronics from "./side-image/responsive.png";
import home from "./side-image/home.png";
import grocery from "./side-image/restaurant.png";
import baby from "./side-image/baby.png";
import beauty from "./side-image/skin-care.png";
import sports from "./side-image/sports.png";
import gaming from "./side-image/console.png";

function Sidebar({ user }) {
  const [open, setOpen] = useState(false); // toggle sidebar

  // If user is admin, hide this sidebar
  if (user && user.role === "admin") return null;

  return (
    <>
      {/* Arrow toggle button */}
      <button
        className={`sidebar-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="arrow">{open ? "←" : "→"}</span>
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="main-body">
          <div className="head-container">
            <div className="side-head">Categories</div>
          </div>

          <div className="container">
            <img src={fashion} className="side" />
            <NavLink to="#fashion">Fashion and Apparel</NavLink>
          </div>

          <div className="container">
            <img src={electronics} className="side" />
            <NavLink to="#electronics">Electronics</NavLink>
          </div>

          <div className="container">
            <img src={home} className="side" />
            <NavLink to="#home-living">Home and Living</NavLink>
          </div>

          <div className="container">
            <img src={grocery} className="side" />
            <NavLink to="#grocery">Grocery and Essentials</NavLink>
          </div>

          <div className="container">
            <img src={baby} className="side" />
            <NavLink to="#baby">Baby and Kids</NavLink>
          </div>

          <div className="container">
            <img src={beauty} className="side" />
            <NavLink to="#beauty">Beauty and Personal Care</NavLink>
          </div>

          <div className="container">
            <img src={sports} className="side" />
            <NavLink to="#sports">Sports and Outdoors</NavLink>
          </div>

          <div className="container">
            <img src={gaming} className="side" />
            <NavLink to="#gaming">Gaming</NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
