import React from 'react';
import './Header.css';

const Header = ({ salesmenCount, onSalesmenChange, onGenerateClusters }) => {
  return (
    <header className="header">
      <h1>Route Optimization Tool</h1>
      
      <div className="header-controls">
        <div className="salesmen-selector">
          <label htmlFor="salesmen-count">Salesmen:</label>
          <select 
            id="salesmen-count"
            value={salesmenCount} 
            onChange={(e) => onSalesmenChange(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn btn-primary generate-clusters-btn"
          onClick={onGenerateClusters}
        >
          🎯 Generate Clusters
        </button>
      </div>
    </header>
  );
};

export default Header; 