import React from 'react';
import './Header.css';

const Header = ({ salesmenCount, onSalesmenChange }) => {
  const handleSalesmenChange = (e) => {
    onSalesmenChange(parseInt(e.target.value));
  };

  return (
    <header className="header">
      <h1>🚚 Route Optimization Tool</h1>
      <div className="header-controls">
        <div className="salesmen-selector">
          <label>Salesmen:</label>
          <select value={salesmenCount} onChange={handleSalesmenChange}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
        <button className="btn btn-secondary">Load</button>
        <button className="btn btn-primary">Save</button>
        <button className="btn btn-secondary">⚙️</button>
      </div>
    </header>
  );
};

export default Header; 