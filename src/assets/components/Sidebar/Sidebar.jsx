import React, { useState } from "react";
import "./Sidebar.css";
import fashion from "./side-image/fashion.png";
import electronics from "./side-image/responsive.png";
import home from "./side-image/home.png";
import grocery from "./side-image/restaurant.png";
import baby from "./side-image/baby.png";
import beauty from "./side-image/skin-care.png";
import sports from "./side-image/sports.png";
import gaming from "./side-image/console.png";

function Sidebar() {
  const [open, setOpen] = useState(false); // toggle sidebar

  return (
    <>
      {/* Arrow toggle button */}
      <button
        className={`sidebar-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {/* Arrow rotates based on state */}
        <span className="arrow">{open ? "←" : "→"}</span>
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="main-body">
          <div className="head-container">
            <div className="side-head">Categories</div>
          </div>

          <div className="container">
            <img src={fashion} className="side" />
            <a href="#fashion">Fashion and Apparel</a>
          </div>

          <div className="container">
            <img src={electronics} className="side" />
            <a href="#electronics">Electronics</a>
          </div>

          <div className="container">
            <img src={home} className="side" />
            <a href="#home-living">Home and Living</a>
          </div>

          <div className="container">
            <img src={grocery} className="side" />
            <a href="#grocery">Grocery and Essentials</a>
          </div>

          <div className="container">
            <img src={baby} className="side" />
            <a href="#baby">Baby and Kids</a>
          </div>

          <div className="container">
            <img src={beauty} className="side" />
            <a href="#beauty">Beauty and Personal Care</a>
          </div>

          <div className="container">
            <img src={sports} className="side" />
            <a href="#sports">Sports and Outdoors</a>
          </div>

          <div className="container">
            <img src={gaming} className="side" />
            <a href="#gaming">Gaming</a>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
