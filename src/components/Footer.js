import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="status-indicator">
        <div className="status-dot"></div>
        <span>System Ready - All routes optimized</span>
      </div>
      
      <div className="quick-actions">
        <button className="btn btn-primary">Export Routes</button>
        <button className="btn btn-secondary">Generate Report</button>
        <button className="btn btn-secondary">Share Plan</button>
      </div>
    </footer>
  );
};

export default Footer; 