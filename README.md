# Route Optimization Tool - Blueprint

## Overview
A map-based route optimization tool for PVC pipe distributors to efficiently assign salesmen to shop territories and plan optimal delivery routes.

## Core Features

### 1. Interactive Map Interface
- **Central Map Display**: Full-screen interactive map showing all shop locations
- **Shop Markers**: Visual indicators for each shop with:
  - Shop name/ID
  - Status indicators (visited, pending, priority)
  - Click-to-view details
- **Territory Visualization**: Color-coded regions showing each salesman's assigned territory
- **Route Lines**: Visual paths showing planned routes between shops

### 2. Territory Assignment & Clustering
- **Automatic Clustering**: Algorithm-based territory division based on:
  - Number of available salesmen
  - Shop density and geographic distribution
  - Distance optimization
- **Cluster Visualization**: Each territory displayed with distinct colors
- **Salesman Assignment**: Clear labeling of which salesman covers which territory

### 3. Manual Route Adjustment
- **Drag & Drop Interface**: Ability to move shops between territories
- **Lasso Selection Tool**: Free-form area selection tool for assigning shops to territories
  - Click and drag to draw custom shapes
  - Automatically selects shops within the drawn area
  - Visual feedback with high-visibility traces
  - Assigns selected shops to the currently selected territory
- **Route Planning Tools**: 
  - Click-to-add waypoints
  - Drag to reorder stops
  - Split/merge territories
- **Real-time Updates**: Immediate visual feedback when making changes

### 4. Route Guidance & Optimization
- **Smart Suggestions**: AI-powered recommendations for:
  - Optimal route sequences
  - Territory rebalancing
  - Time-efficient paths
- **Route Metrics**: Display of:
  - Total distance per route
  - Estimated travel time
  - Number of shops per territory
- **Efficiency Indicators**: Visual cues for route optimization opportunities

### 5. Planning & Management Features
- **Territory Overview Panel**: Sidebar showing:
  - List of all salesmen
  - Assigned shop counts
  - Territory statistics
- **Route Details**: Expandable panels for each route showing:
  - Shop sequence
  - Distance calculations
  - Time estimates
- **Save/Load Configurations**: Ability to save different route plans

## User Interface Layout

### Main Components:
1. **Header Bar**
   - Tool title and logo
   - Number of salesmen selector
   - Save/Load buttons
   - Settings menu

2. **Left Sidebar - Territory Management**
   - Salesmen list with assigned territories
   - Territory statistics
   - Quick actions (add/remove salesmen)

3. **Center - Interactive Map**
   - Full-screen map with shop markers
   - Territory overlays
   - Route visualization
   - Zoom and pan controls
   - **Lasso Tool**: Toggle button in right sidebar to activate free-form area selection

4. **Right Sidebar - Route Details**
   - Selected territory details
   - Route optimization suggestions
   - Manual adjustment tools including Lasso Tool toggle
   - Performance metrics
   - **Lasso Instructions**: Step-by-step guide when tool is active

5. **Bottom Panel - Quick Actions**
   - Route optimization button
   - Territory rebalancing
   - Export options

## Technical Architecture

### Frontend Technologies:
- **Map Engine**: Leaflet.js for interactive mapping
- **UI Framework**: React.js for component-based interface
- **Styling**: CSS Grid/Flexbox for responsive layout
- **State Management**: React hooks for route data

### Core Algorithms:
- **Clustering**: K-means or hierarchical clustering for territory division
- **Route Optimization**: Traveling Salesman Problem (TSP) algorithms
- **Distance Calculation**: Haversine formula for geographic distances
- **Lasso Selection**: Point-in-polygon algorithm for area-based shop selection

### Data Structure:
```javascript
{
  salesmen: [
    {
      id: "salesman_1",
      name: "John Doe",
      territory: ["shop_1", "shop_2", "shop_3"],
      routes: [...]
    }
  ],
  shops: [
    {
      id: "shop_1",
      name: "ABC Hardware",
      coordinates: {lat: 40.7128, lng: -74.0060},
      priority: "high",
      status: "pending"
    }
  ],
  territories: [
    {
      id: "territory_1",
      salesman_id: "salesman_1",
      shops: [...],
      color: "#FF6B6B"
    }
  ]
}
```

## User Workflow

### 1. Initial Setup
- Upload or input shop location data
- Set number of salesmen
- Configure optimization preferences

### 2. Territory Assignment
- Use automatic clustering to create initial territories
- **Lasso Tool Workflow**:
  - Select a territory from the left sidebar
  - Click the "🎯 Lasso Tool" button in the right sidebar
  - Click and drag on the map to draw a custom selection area
  - Release to automatically assign shops within the area to the selected territory
  - Visual feedback shows the drawn area and selected shops
- Manually adjust territories by dragging shops between areas

### 3. Route Optimization
- Review optimization suggestions
- Manually reorder stops within territories
- Analyze performance metrics
- Save optimized configurations

## Lasso Tool Features

### Visual Feedback:
- **Drawing Phase**: Red dashed line follows mouse movement with high visibility
- **Selection Phase**: Red polygon with dashed border shows selected area
- **Duration**: Selection area remains visible for 3 seconds after completion
- **Enhanced Styling**: 6px stroke width, glow effects, and high contrast colors

### Technical Implementation:
- **Event Handling**: Mouse down, move, and up events for drawing
- **Path Creation**: Dynamic polyline updates during drawing
- **Polygon Conversion**: Automatic conversion to polygon for area calculation
- **Shop Detection**: Point-in-polygon algorithm for accurate selection
- **Territory Assignment**: Automatic assignment to currently selected territory

### User Experience:
- **Intuitive Controls**: Click and drag to draw, release to select
- **Real-time Feedback**: Visual updates during drawing process
- **Error Handling**: Graceful fallbacks and informative console logging
- **Accessibility**: Clear instructions and visual cues throughout the process