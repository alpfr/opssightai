import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()


class Database:
    def __init__(self):
        self.connection_params = {
            'host': os.getenv('DATABASE_HOST', 'localhost'),
            'port': int(os.getenv('DATABASE_PORT', 5433)),
            'database': os.getenv('DATABASE_NAME', 'opssight'),
            'user': os.getenv('DATABASE_USER', 'postgres'),
            'password': os.getenv('DATABASE_PASSWORD', 'postgres')
        }
    
    def get_connection(self):
        return psycopg2.connect(**self.connection_params)
    
    def get_sensor_data(self, asset_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch recent sensor data for an asset"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT timestamp, sensor_type, value, unit
                    FROM sensor_readings
                    WHERE asset_id = %s
                    ORDER BY timestamp DESC
                    LIMIT %s
                """, (asset_id, limit))
                return cursor.fetchall()
        finally:
            conn.close()
    
    def get_asset_info(self, asset_id: str) -> Dict[str, Any]:
        """Fetch asset information"""
        conn = self.get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT id, name, type, location, metadata, status, current_risk_score
                    FROM assets
                    WHERE id = %s
                """, (asset_id,))
                return cursor.fetchone()
        finally:
            conn.close()
    
    def store_risk_score(self, asset_id: str, risk_score: float, explanation: str, 
                        risk_factors: List[Dict[str, Any]], confidence: float):
        """Store calculated risk score"""
        import json
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                # Insert risk score
                cursor.execute("""
                    INSERT INTO risk_scores (time, asset_id, score, explanation, factors, confidence, model_version)
                    VALUES (NOW(), %s, %s, %s, %s, %s, %s)
                """, (asset_id, risk_score, explanation, json.dumps(risk_factors), confidence, '1.0.0'))
                
                # Update current risk score on asset
                cursor.execute("""
                    UPDATE assets
                    SET current_risk_score = %s, updated_at = NOW()
                    WHERE id = %s
                """, (risk_score, asset_id))
                
                conn.commit()
        finally:
            conn.close()


db = Database()
