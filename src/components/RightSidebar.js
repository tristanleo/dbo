import React from 'react';
import { generateOptimizationSuggestions } from '../utils/sampleData';
import './RightSidebar.css';

const RightSidebar = ({ selectedTerritory, territories, collapsed, onToggle, isLassoActive, onLassoToggle }) => {
  const suggestions = selectedTerritory ? generateOptimizationSuggestions(selectedTerritory) : [];

  return (
    <aside className={`sidebar-right ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed ? (
        <>
          <div className="sidebar-header">
            <h3>Route Details</h3>
            <button className="collapse-btn" onClick={onToggle}>
              →
            </button>
          </div>
          
          {selectedTerritory ? (
            <>
              <div className="route-details">
                <h3>Route Details - {selectedTerritory.name}</h3>
                
                <div className="metric-card">
                  <div className="metric-label">Total Distance</div>
                  <div className="metric-value">{selectedTerritory.totalDistance} km</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-label">Estimated Time</div>
                  <div className="metric-value">{selectedTerritory.estimatedTime} hours</div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-label">Shops to Visit</div>
                  <div className="metric-value">{selectedTerritory.shopCount} shops</div>
                </div>
              </div>

              <div className="optimization-suggestions">
                <h4>💡 Optimization Suggestions</h4>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className={`suggestion-item suggestion-${suggestion.priority}`}>
                    <strong>{suggestion.type.replace('_', ' ').toUpperCase()}:</strong> {suggestion.message}
                  </div>
                ))}
              </div>

              <h3>Manual Adjustments</h3>
              <div className="manual-adjustments">
                <button className="btn btn-primary">Reorder Stops</button>
                <button 
                  className={`btn ${isLassoActive ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={onLassoToggle}
                >
                  {isLassoActive ? '🎯 Rectangle Tool (Active)' : '🎯 Rectangle Tool'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h3>Select a Territory</h3>
              <p>Click on a territory in the left sidebar to view its details and optimization suggestions.</p>
            </div>
          )}
        </>
      ) : (
        <div className="collapsed-content">
          {selectedTerritory ? (
            <div className="territory-info">
              <div className="territory-name">{selectedTerritory.name}</div>
              <div className="territory-stats">
                <div>{selectedTerritory.shopCount} shops</div>
                <div>{selectedTerritory.totalDistance} km</div>
                <div>~{selectedTerritory.estimatedTime}h</div>
              </div>
            </div>
          ) : (
            <div className="no-selection-collapsed">
              <span>Select Territory</span>
            </div>
          )}
          <button className="btn btn-primary expand-btn" onClick={onToggle} title="Expand Route Details">
            ←
          </button>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar; 