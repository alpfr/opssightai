from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from models import RiskCalculationRequest, RiskCalculationResponse
from risk_engine import risk_engine
from database import db

load_dotenv()

app = FastAPI(title="OpsSight AI - Risk Scoring Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        conn = db.get_connection()
        conn.close()
        return {
            "status": "healthy",
            "service": "risk-scoring",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "risk-scoring",
            "database": "disconnected",
            "error": str(e)
        }


@app.post("/api/risk/calculate", response_model=RiskCalculationResponse)
async def calculate_risk(request: RiskCalculationRequest):
    """
    Calculate risk score for an asset
    """
    try:
        # Verify asset exists
        asset_info = db.get_asset_info(request.asset_id)
        if not asset_info:
            raise HTTPException(status_code=404, detail=f"Asset {request.asset_id} not found")
        
        # Calculate risk score
        risk_score = risk_engine.calculate_risk_score(request.asset_id, request.asset_type)
        
        # Store risk score in database
        risk_factors_data = [
            {
                'factor': rf.factor,
                'contribution': rf.contribution,
                'description': rf.description
            }
            for rf in risk_score.risk_factors
        ]
        
        db.store_risk_score(
            asset_id=risk_score.asset_id,
            risk_score=risk_score.risk_score,
            explanation=risk_score.explanation,
            risk_factors=risk_factors_data,
            confidence=risk_score.confidence
        )
        
        return RiskCalculationResponse(
            success=True,
            risk_score=risk_score
        )
    
    except HTTPException:
        raise
    except Exception as e:
        return RiskCalculationResponse(
            success=False,
            error=str(e)
        )


@app.get("/")
async def root():
    return {
        "service": "OpsSight AI - Risk Scoring Service",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    port = int(os.getenv("SERVICE_PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
