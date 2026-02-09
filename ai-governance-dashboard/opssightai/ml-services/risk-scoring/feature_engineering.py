import numpy as np
import pandas as pd
from typing import List, Dict, Any


def extract_statistical_features(sensor_data: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Extract statistical features from sensor data for risk scoring
    """
    if not sensor_data:
        return {}
    
    # Convert to DataFrame for easier processing
    df = pd.DataFrame(sensor_data)
    
    features = {}
    
    # Group by sensor type and calculate statistics
    for sensor_type in df['sensor_type'].unique():
        sensor_df = df[df['sensor_type'] == sensor_type]
        values = sensor_df['value'].values
        
        if len(values) > 0:
            features[f'{sensor_type}_mean'] = float(np.mean(values))
            features[f'{sensor_type}_std'] = float(np.std(values))
            features[f'{sensor_type}_min'] = float(np.min(values))
            features[f'{sensor_type}_max'] = float(np.max(values))
            features[f'{sensor_type}_range'] = float(np.max(values) - np.min(values))
            
            # Calculate trend (simple linear regression slope)
            if len(values) > 1:
                x = np.arange(len(values))
                slope = np.polyfit(x, values, 1)[0]
                features[f'{sensor_type}_trend'] = float(slope)
            
            # Calculate coefficient of variation
            if np.mean(values) != 0:
                features[f'{sensor_type}_cv'] = float(np.std(values) / np.mean(values))
    
    return features


def calculate_risk_factors(features: Dict[str, float], asset_type: str) -> List[Dict[str, Any]]:
    """
    Calculate risk factors based on features and asset type
    """
    risk_factors = []
    
    # Define thresholds based on asset type
    thresholds = {
        'transformer': {
            'temperature_max': 80.0,
            'voltage_std': 5.0,
            'current_max': 100.0
        },
        'motor': {
            'temperature_max': 90.0,
            'vibration_std': 2.0,
            'current_max': 150.0
        },
        'generator': {
            'temperature_max': 85.0,
            'voltage_std': 3.0,
            'current_max': 200.0
        },
        'pump': {
            'temperature_max': 75.0,
            'vibration_std': 1.5,
            'pressure_std': 5.0
        }
    }
    
    asset_thresholds = thresholds.get(asset_type, thresholds['transformer'])
    
    # Check temperature
    if 'temperature_max' in features:
        temp_max = features['temperature_max']
        threshold = asset_thresholds.get('temperature_max', 80.0)
        if temp_max > threshold:
            contribution = min(((temp_max - threshold) / threshold) * 100, 40.0)
            risk_factors.append({
                'factor': 'High Temperature',
                'contribution': contribution,
                'description': f'Maximum temperature ({temp_max:.1f}°C) exceeds safe threshold ({threshold}°C)'
            })
    
    # Check voltage variability
    if 'voltage_std' in features:
        voltage_std = features['voltage_std']
        threshold = asset_thresholds.get('voltage_std', 5.0)
        if voltage_std > threshold:
            contribution = min(((voltage_std - threshold) / threshold) * 100, 30.0)
            risk_factors.append({
                'factor': 'Voltage Instability',
                'contribution': contribution,
                'description': f'Voltage variability ({voltage_std:.2f}V) indicates unstable power supply'
            })
    
    # Check vibration
    if 'vibration_std' in features:
        vibration_std = features['vibration_std']
        threshold = asset_thresholds.get('vibration_std', 2.0)
        if vibration_std > threshold:
            contribution = min(((vibration_std - threshold) / threshold) * 100, 35.0)
            risk_factors.append({
                'factor': 'Excessive Vibration',
                'contribution': contribution,
                'description': f'Vibration variability ({vibration_std:.2f}) suggests mechanical issues'
            })
    
    # Check current overload
    if 'current_max' in features:
        current_max = features['current_max']
        threshold = asset_thresholds.get('current_max', 100.0)
        if current_max > threshold:
            contribution = min(((current_max - threshold) / threshold) * 100, 30.0)
            risk_factors.append({
                'factor': 'Current Overload',
                'contribution': contribution,
                'description': f'Peak current ({current_max:.1f}A) exceeds rated capacity ({threshold}A)'
            })
    
    # Check pressure variability (for pumps)
    if 'pressure_std' in features:
        pressure_std = features['pressure_std']
        threshold = asset_thresholds.get('pressure_std', 5.0)
        if pressure_std > threshold:
            contribution = min(((pressure_std - threshold) / threshold) * 100, 25.0)
            risk_factors.append({
                'factor': 'Pressure Instability',
                'contribution': contribution,
                'description': f'Pressure variability ({pressure_std:.2f}) indicates flow issues'
            })
    
    return risk_factors
