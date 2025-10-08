import React, { useState } from "react";
import {Link} from "react-router-dom";
import "./UserProfile.css";

function UserProfile({ user, setUser }) {
  

  return (
    <div class="container">
    <aside className="sidebar">
               <div className="main-body"> 
                       <div className="head-container">
                           <div className="side-head">Menu</div>
                       </div>
                       <div className="container">
                           <a href="#fashion">Account</a>
                       </div>
   
                       <div className="container">
                           <a href="#electronics">Orders</a>
                       </div>
   
                       <div className="container">
                           <a href="#">Settings</a>
                       </div>
   
                       <div className="container">
                           <a href="#">Support</a>
                       </div>
   
                       
               </div>
       </aside>

    <div class="profile-section">
      <div class="profile-card">
        <img src="https://via.placeholder.com/120" alt="Profile Picture" class="profile-pic" />
        <h1>User Profile</h1>

        <div class="user-info">
          <p><span>Name:</span> John Doe</p>
          <p><span>Email:</span> johndoe@example.com</p>
          <p><span>Phone:</span> +123 456 7890</p>

        </div>
        <div class="user-info">
          <h4><u>Delivery Address</u></h4>
          <p><span>Region:</span> Greater Accra</p>
          <p><span>City:</span> Tema</p>
          <p><span>Community:</span> 22</p>

        </div>

        <div class="buttons">
          <button>Edit Profile</button>
          <button class="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  </div>  
  );
}


export default UserProfile