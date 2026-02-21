import numpy as np
from typing import Dict, Any, List
from datetime import datetime
from database import db
from feature_engineering import extract_statistical_features, calculate_risk_factors
from models import RiskScore, RiskFactor


class RiskEngine:
    """
    Risk scoring engine that calculates asset risk scores based on sensor data
    """
    
    def __init__(self):
        self.base_risk_scores = {
            'transformer': 20.0,
            'motor': 25.0,
            'generator': 30.0,
            'pump': 15.0,
            'default': 20.0
        }
    
    def calculate_risk_score(self, asset_id: str, asset_type: str) -> RiskScore:
        """
        Calculate risk score for an asset based on recent sensor data
        """
        # Fetch sensor data
        sensor_data = db.get_sensor_data(asset_id, limit=100)
        
        if not sensor_data:
            # No data available, return baseline risk
            base_risk = self.base_risk_scores.get(asset_type, self.base_risk_scores['default'])
            return RiskScore(
                asset_id=asset_id,
                risk_score=base_risk,
                timestamp=datetime.now(),
                explanation=f"Baseline risk score for {asset_type}. No sensor data available yet.",
                risk_factors=[],
                confidence=0.3
            )
        
        # Extract features
        features = extract_statistical_features(sensor_data)
        
        # Calculate risk factors
        risk_factors_data = calculate_risk_factors(features, asset_type)
        
        # Calculate overall risk score
        base_risk = self.base_risk_scores.get(asset_type, self.base_risk_scores['default'])
        
        # Sum contributions from risk factors
        total_contribution = sum(rf['contribution'] for rf in risk_factors_data)
        
        # Calculate final risk score (capped at 100)
        risk_score = min(base_risk + total_contribution, 100.0)
        
        # Generate explanation
        explanation = self._generate_explanation(risk_score, risk_factors_data, asset_type)
        
        # Calculate confidence based on data availability
        confidence = min(len(sensor_data) / 100.0, 1.0)
        
        # Convert risk factors to RiskFactor objects
        risk_factors = [
            RiskFactor(
                factor=rf['factor'],
                contribution=rf['contribution'],
                description=rf['description']
            )
            for rf in risk_factors_data
        ]
        
        return RiskScore(
            asset_id=asset_id,
            risk_score=round(risk_score, 1),
            timestamp=datetime.now(),
            explanation=explanation,
            risk_factors=risk_factors,
            confidence=round(confidence, 2)
        )
    
    def _generate_explanation(self, risk_score: float, risk_factors: List[Dict[str, Any]], 
                            asset_type: str) -> str:
        """
        Generate human-readable explanation for the risk score
        """
        if risk_score < 30:
            risk_level = "LOW"
            summary = f"The {asset_type} is operating within normal parameters."
        elif risk_score < 60:
            risk_level = "MEDIUM"
            summary = f"The {asset_type} shows some concerning indicators that warrant monitoring."
        elif risk_score < 80:
            risk_level = "HIGH"
            summary = f"The {asset_type} exhibits significant risk factors requiring attention."
        else:
            risk_level = "CRITICAL"
            summary = f"The {asset_type} is at critical risk and requires immediate intervention."
        
        explanation = f"Risk Level: {risk_level} ({risk_score:.1f}/100). {summary}"
        
        if risk_factors:
            explanation += "\n\nKey Risk Factors:"
            for rf in sorted(risk_factors, key=lambda x: x['contribution'], reverse=True)[:3]:
                explanation += f"\n- {rf['factor']} (+{rf['contribution']:.1f} points): {rf['description']}"
        else:
            explanation += " All monitored parameters are within acceptable ranges."
        
        return explanation


risk_engine = RiskEngine()
