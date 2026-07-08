import React from 'react'
import "./module.css"

const ProductNav = () => {
    

  return (
    <nav className="navbar">

      {/* Left Section */}
      <div className="nav-left">
        <div className="dropdown">
          <button className="drop-btn">
            Categories ▾
          </button>
        </div>

        <div className="dropdown">
          <button className="drop-btn">
            New Products ▾
          </button>
        </div>
      </div>

      {/* Center Search */}
      <div className="nav-center">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
        />
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <button className="nav-btn">Men</button>
        <button className="nav-btn">Women</button>
        <button className="nav-btn">Brands</button>
      </div>

    </nav>
  )
}

export default ProductNav
