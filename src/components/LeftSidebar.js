import React from 'react';
import './LeftSidebar.css';

const LeftSidebar = ({ territories, selectedTerritory, onTerritorySelect, collapsed, onToggle }) => {
  return (
    <aside className={`sidebar-left ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed ? (
        <>
          <div className="sidebar-header">
            <h3>Territory Overview</h3>
            <button className="collapse-btn" onClick={onToggle}>
              ←
            </button>
          </div>
          
          <div className="territory-list">
            {territories.map(territory => (
              <div 
                key={territory.id}
                className={`territory-item ${selectedTerritory?.id === territory.id ? 'active' : ''}`}
                onClick={() => onTerritorySelect(territory)}
              >
                <div className="territory-header">
                  <span><strong>{territory.name}</strong></span>
                  <div 
                    className="territory-color" 
                    style={{ background: territory.color }}
                  ></div>
                </div>
                <div className="territory-stats">
                  {territory.shopCount} shops • {territory.totalDistance} km • ~{territory.estimatedTime} hours
                </div>
              </div>
            ))}
          </div>

          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary">+ Add Salesman</button>
            <button className="btn btn-secondary">Rebalance Territories</button>
            <button className="btn btn-secondary">Optimize Routes</button>
          </div>
        </>
      ) : (
        <div className="collapsed-content">
          <div className="territory-summary">
            {territories.map(territory => (
              <div 
                key={territory.id}
                className={`territory-dot ${selectedTerritory?.id === territory.id ? 'active' : ''}`}
                style={{ background: territory.color }}
                onClick={() => onTerritorySelect(territory)}
                title={`${territory.name}: ${territory.shopCount} shops`}
              ></div>
            ))}
          </div>
          <button className="btn btn-primary expand-btn" onClick={onToggle} title="Expand Territory Overview">
            →
          </button>
        </div>
      )}
    </aside>
  );
};

export default LeftSidebar; 