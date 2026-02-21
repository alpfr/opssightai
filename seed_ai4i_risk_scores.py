import psycopg2
import datetime
import random

print("Connecting to the GKE PostgreSQL Database...")
conn = psycopg2.connect(
    host="localhost",
    port=5433,
    database="opssightai",
    user="postgres",
    password="OpsSightSecureDBPassword2026!"
)
cur = conn.cursor()

machine_id = "5d327de8-5571-4e03-9a57-f06469d4fae8"

# Delete any existing risk scores for safety
cur.execute("DELETE FROM risk_scores WHERE asset_id = %s", (machine_id,))

print("Generating 34 chronological risk score data points for AI4I Milling Machine...")
end_time = datetime.datetime.now(datetime.timezone.utc)

risk_data = []

# Generate 1 point per day at noon
startDate = end_time - datetime.timedelta(days=34)

for dayIndex in range(35):
    timestamp = startDate + datetime.timedelta(days=dayIndex)
    timestamp = timestamp.replace(hour=12, minute=0, second=0, microsecond=0)
    
    # Calculate risk score based on sensor readings - mimic the node generator
    baseRisk = 20 + random.random() * 30
    trendRisk = (dayIndex / 34) * 15
    randomRisk = random.random() * 10
    
    # Toward the end dates (last 5 days), spike the risk heavily to simulate pre-failure states
    if dayIndex > 29:
        baseRisk += 30
        
    riskScore = min(100, baseRisk + trendRisk + randomRisk)
    
    risk_data.append((
        timestamp.isoformat(),
        machine_id,
        round(riskScore, 2),
        "Risk Assessment for AI4I Milling Machine",
        0.85
    ))

from psycopg2.extras import execute_values
execute_values(cur, """
INSERT INTO risk_scores (time, asset_id, score, explanation, confidence)
VALUES %s ON CONFLICT DO NOTHING
""", risk_data)

conn.commit()
print(f"Generated {len(risk_data)} daily risk scores successfully!")

cur.close()
conn.close()
