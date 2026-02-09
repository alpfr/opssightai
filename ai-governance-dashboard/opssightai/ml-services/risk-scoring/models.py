from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class SensorReading(BaseModel):
    timestamp: datetime
    sensor_type: str
    value: float
    unit: str


class RiskFactor(BaseModel):
    factor: str
    contribution: float
    description: str


class RiskScore(BaseModel):
    asset_id: str
    risk_score: float = Field(ge=0, le=100)
    timestamp: datetime
    explanation: str
    risk_factors: List[RiskFactor]
    confidence: float = Field(ge=0, le=1)


class RiskCalculationRequest(BaseModel):
    asset_id: str
    asset_type: str


class RiskCalculationResponse(BaseModel):
    success: bool
    risk_score: Optional[RiskScore] = None
    error: Optional[str] = None
