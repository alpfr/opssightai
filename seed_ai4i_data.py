import pandas as pd
import requests
import psycopg2
from psycopg2.extras import execute_values
import io
import uuid
import datetime

url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00601/ai4i2020.csv"
print("Downloading AI4I 2020 dataset from UCI ML Repository...")
response = requests.get(url)
response.raise_for_status()

# Read CSV into a DataFrame
df = pd.read_csv(io.StringIO(response.text))
print(f"Downloaded {len(df)} rows.")

print("Connecting to the GKE PostgreSQL Database...")
conn = psycopg2.connect(
    host="localhost",
    port=5433,
    database="opssightai",
    user="postgres",
    password="OpsSightSecureDBPassword2026!"
)
cur = conn.cursor()

# 1. Create a specialized Asset for this dataset
machine_id = str(uuid.uuid4())
asset_name = "AI4I Milling Machine"
print(f"Creating Asset: {asset_name} ({machine_id})...")

cur.execute("""
INSERT INTO assets (id, name, type, plant_id, metadata, status, current_risk_score) 
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT DO NOTHING
""", (machine_id, asset_name, "milling_machine", "PLANT-001", '{"dataset": "AI4I 2020", "manufacturer": "Kaggle", "model": "Predictive Maintenance Simulator"}', "active", 50.0))

print("Asset created!")

# 2. Map the CSV time-series into sensor_readings
end_time = datetime.datetime.now(datetime.timezone.utc)

# 10,000 rows * 5 minutes = 50,000 minutes = ~34.7 days of data
print(f"Generating {len(df) * 5} realistic sensor reading records over the past 34 days...")
batch_data = []

for i, row in df.iterrows():
    # Rows are ordered chronologically; row 0 is 34 days ago, last row is now.
    ts = (end_time - datetime.timedelta(minutes=5 * (len(df) - i - 1))).isoformat()
    
    # 5 sensors per row:
    # Air temperature [K] -> Convert to Celsius
    air_temp_c = row["Air temperature [K]"] - 273.15
    batch_data.append((ts, machine_id, "air_temperature", round(air_temp_c, 2), "°C", "good"))
    
    # Process temperature [K] -> Convert to Celsius
    proc_temp_c = row["Process temperature [K]"] - 273.15
    batch_data.append((ts, machine_id, "process_temperature", round(proc_temp_c, 2), "°C", "good"))
    
    # Rotational speed [rpm]
    batch_data.append((ts, machine_id, "rotational_speed", round(row["Rotational speed [rpm]"], 2), "rpm", "good"))
    
    # Torque [Nm]
    batch_data.append((ts, machine_id, "torque", round(row["Torque [Nm]"], 2), "Nm", "good"))
    
    # Tool wear [min]
    batch_data.append((ts, machine_id, "tool_wear", round(row["Tool wear [min]"], 2), "min", "good"))

print("Writing time-series payload to GKE...")
# Write in bulk to optimize network transfer bounds
execute_values(cur, """
INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit, quality)
VALUES %s ON CONFLICT DO NOTHING
""", batch_data, page_size=5000)


# 3. Import marked failures as Anomalies
print("Analyzing labeled failure distributions...")
anomalies_data = []
for i, row in df.iterrows():
    if row["Machine failure"] == 1:
        ts = (end_time - datetime.timedelta(minutes=5 * (len(df) - i - 1))).isoformat()
        
        failure_mode = ""
        if row.get("TWF") == 1: failure_mode += "Tool Wear Failure. "
        if row.get("HDF") == 1: failure_mode += "Heat Dissipation Failure. "
        if row.get("PWF") == 1: failure_mode += "Power Failure. "
        if row.get("OSF") == 1: failure_mode += "Overstrain Failure. "
        if row.get("RNF") == 1: failure_mode += "Random Failures. "
        if not failure_mode: failure_mode = "Unknown Machine Failure."
            
        anomalies_data.append((
            machine_id, ts, "critical", "multiple_sensors",
            0.0, 1.0, 100.0,
            f"Ground-Truth Confirmed Kaggle AI4I Failure: {failure_mode}",
            "open"
        ))

if anomalies_data:
    execute_values(cur, """
    INSERT INTO anomalies (asset_id, timestamp, severity, metric, expected_value, actual_value, deviation, description, status)
    VALUES %s
    """, anomalies_data)
    print(f"Registered {len(anomalies_data)} ground-truth anomalies!")

conn.commit()
cur.close()
conn.close()

print("🏁 ETL Seed Complete! The UI natively visualizes the AI4I Dataset.")
