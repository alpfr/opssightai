# Charts and Visualizations Implementation

## Overview
Successfully implemented interactive charts and visualizations for the Asset Detail page using Recharts library.

## Implementation Date
February 8, 2026

## Components Created

### 1. RiskScoreChart.tsx
**Purpose**: Display historical risk scores over time with threshold reference lines

**Features**:
- Line chart showing risk score trends
- Reference lines for risk levels (Low: 30, Medium: 60, High: 80)
- Color-coded thresholds (Green, Orange, Red)
- Responsive design
- Date formatting on X-axis

**Data Source**: `/api/risk/:assetId/history`

### 2. SensorDataChart.tsx
**Purpose**: Display multiple sensor readings over time on a single chart

**Features**:
- Multi-line chart supporting multiple sensor types
- Dynamic color assignment for different sensors
- Automatic legend generation
- Responsive design
- Time-series data visualization

**Data Source**: `/api/data/:assetId`

### 3. AnomalyTimeline.tsx
**Purpose**: Visualize anomalies as a scatter plot timeline

**Features**:
- Scatter plot with time on X-axis and severity on Y-axis
- Color-coded severity levels (Low: Green, Medium: Orange, High: Red, Critical: Dark Red)
- Custom tooltip showing full anomaly details
- Interactive data points
- Severity labels on Y-axis

**Data Source**: `/api/anomalies/:assetId`

### 4. ForecastChart.tsx
**Purpose**: Display 30-day risk score forecast with confidence intervals

**Features**:
- Line chart showing predicted risk scores
- Shaded confidence interval area
- Upper and lower bound visualization
- Date formatting
- Forecast metadata display (generation time, horizon)

**Data Source**: `/api/forecast/:assetId`

## API Enhancements

### Added API Methods (frontend/src/services/api.ts)

```typescript
// Risk API
export const riskApi = {
  calculate: (assetId: string, assetType: string) => 
    api.post('/risk/calculate', { assetId, assetType }),
  getCurrent: (assetId: string) => api.get(`/risk/${assetId}`),
  getHistory: (assetId: string, params?: any) => 
    api.get(`/risk/${assetId}/history`, { params }),
};

// Anomaly API
export const anomalyApi = {
  detect: (assetId: string, assetType: string) => 
    api.post('/anomalies/detect', { assetId, assetType }),
  getByAsset: (assetId: string, params?: any) => 
    api.get(`/anomalies/${assetId}`, { params }),
  getCritical: (params?: any) => 
    api.get('/anomalies/critical/all', { params }),
};

// Forecast API
export const forecastApi = {
  get: (assetId: string) => api.get(`/forecast/${assetId}`),
  refresh: (assetId: string) => api.post(`/forecast/${assetId}/refresh`),
};
```

## AssetDetail Page Updates

### New State Variables
- `riskHistory`: Array of historical risk scores
- `anomalies`: Array of detected anomalies
- `forecast`: Forecast data with predictions
- `chartsLoading`: Loading state for chart data

### Data Loading Strategy
1. Load basic asset info and recent sensor data immediately
2. Load chart data asynchronously in parallel
3. Handle errors gracefully with fallback to empty arrays
4. Display loading indicator while charts are being fetched

### Chart Layout
Charts are displayed in a dedicated section between asset info cards and the sensor data table:
1. Risk Score History Chart
2. Sensor Readings Over Time Chart
3. Anomaly Timeline Chart
4. 30-Day Risk Forecast Chart

Each chart is conditionally rendered only if data is available.

## Styling

### New CSS Classes (AssetDetail.css)
- `.charts-section`: Container for all charts
- `.charts-loading`: Loading state indicator
- `.chart-card`: Individual chart container with card styling
- `.forecast-info`: Metadata display for forecast chart

### Design Principles
- Consistent card-based design matching existing UI
- White background with subtle shadows
- Proper spacing and margins
- Responsive layout
- Professional color scheme

## Test Data Generation

### Historical Data Created
- **Sensor Readings**: 35 days of temperature, voltage, and current data
- **Risk Scores**: 30 days of historical risk scores with varying levels
- **Anomalies**: 6 sample anomalies with different severity levels
- **Forecast**: 30-day prediction generated from historical data

### Test Asset
- **Asset ID**: f2756364-b0df-4247-8d3d-1a49e74196cb
- **Name**: Main Transformer T1
- **Type**: Transformer

## API Endpoints Verified

✅ `GET /api/risk/:assetId/history` - Returns historical risk scores
✅ `GET /api/anomalies/:assetId` - Returns anomalies for asset
✅ `GET /api/forecast/:assetId` - Returns forecast data
✅ `GET /api/data/:assetId` - Returns sensor readings

## Testing Results

### Risk Score Chart
- ✅ Displays 30 days of historical risk scores
- ✅ Reference lines show risk thresholds correctly
- ✅ Data points are properly formatted
- ✅ Chart is responsive

### Sensor Data Chart
- ✅ Displays multiple sensor types on same chart
- ✅ Different colors for each sensor type
- ✅ Legend shows all sensor types
- ✅ Time-series data properly formatted

### Anomaly Timeline
- ✅ Displays 6 anomalies across timeline
- ✅ Color-coded by severity (low, medium, high, critical)
- ✅ Custom tooltip shows full details
- ✅ Y-axis shows severity levels

### Forecast Chart
- ✅ Displays 30-day forecast
- ✅ Confidence intervals shown as shaded area
- ✅ Metadata displayed (generation time, horizon)
- ✅ Predictions properly formatted

## Dependencies

### Added Package
```json
{
  "recharts": "^2.10.3"
}
```

## Browser Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## Performance Considerations
- Charts load asynchronously to avoid blocking UI
- Data fetching happens in parallel
- Error handling prevents chart failures from breaking page
- Responsive design ensures good performance on all screen sizes

## Future Enhancements
1. Add date range filters for charts
2. Implement chart export functionality (PNG, CSV)
3. Add zoom and pan capabilities
4. Real-time data updates via WebSocket
5. Comparison view for multiple assets
6. Customizable chart colors and themes
7. Chart annotations for important events

## Files Modified/Created

### Created
- `opssightai/frontend/src/components/RiskScoreChart.tsx`
- `opssightai/frontend/src/components/SensorDataChart.tsx`
- `opssightai/frontend/src/components/AnomalyTimeline.tsx`
- `opssightai/frontend/src/components/ForecastChart.tsx`

### Modified
- `opssightai/frontend/src/services/api.ts` - Added risk, anomaly, and forecast API methods
- `opssightai/frontend/src/pages/AssetDetail.tsx` - Integrated charts and data loading
- `opssightai/frontend/src/pages/AssetDetail.css` - Added chart styling

## Conclusion
The charts and visualizations feature has been successfully implemented and tested. All four chart types are working correctly with real data from the backend API. The implementation follows best practices for React components, uses a professional charting library (Recharts), and maintains consistency with the existing UI design.

The feature significantly enhances the Asset Detail page by providing visual insights into:
- Risk score trends over time
- Sensor reading patterns
- Anomaly occurrences and severity
- Future risk predictions

Users can now quickly identify patterns, trends, and potential issues through intuitive visual representations of the data.
