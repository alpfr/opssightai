import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>OpsSight AI</h1>
        <p className="tagline">Operational Risk Intelligence Platform</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>About OpsSight AI</h2>
          <p>
            OpsSight AI is an advanced operational risk intelligence platform designed to monitor 
            electrical and industrial assets in real-time. Using cutting-edge AI and machine learning 
            algorithms, we help operations teams identify risks, detect anomalies, and prevent failures 
            before they occur.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            To empower industrial operations teams with intelligent, data-driven insights that enable 
            proactive maintenance, reduce downtime, and ensure the safety and reliability of critical 
            infrastructure.
          </p>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>AI-Powered Risk Scoring</h3>
              <p>
                Advanced algorithms analyze sensor data to generate real-time risk scores (0-100) 
                for each asset, with detailed explanations of contributing factors.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Anomaly Detection</h3>
              <p>
                Statistical methods (Z-score, IQR) automatically detect unusual patterns in asset 
                behavior, classifying anomalies by severity (low, medium, high, critical).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Predictive Forecasting</h3>
              <p>
                30-day forecasts predict future risk trends and potential failures, enabling 
                proactive maintenance scheduling and resource planning.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-Time Monitoring</h3>
              <p>
                Continuous data ingestion from multiple sensor types (temperature, vibration, 
                voltage, current, pressure) with instant risk assessment.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>
                Multi-channel alerts (in-app, email, SMS) for critical risks and anomalies, 
                with customizable preferences and severity thresholds.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Executive Summaries</h3>
              <p>
                Plant-level aggregated reports with AI-generated insights, trending issues, 
                and actionable recommendations for decision-makers.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>React 18+ with TypeScript</li>
                <li>React Router for navigation</li>
                <li>Recharts for data visualization</li>
                <li>WebSocket for real-time updates</li>
              </ul>
            </div>

            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li>Node.js with Express</li>
                <li>TypeScript for type safety</li>
                <li>RESTful API architecture</li>
                <li>JWT authentication</li>
              </ul>
            </div>

            <div className="tech-category">
              <h3>Database</h3>
              <ul>
                <li>TimescaleDB (PostgreSQL)</li>
                <li>Hypertables for time-series data</li>
                <li>Redis for caching</li>
                <li>RabbitMQ for message queuing</li>
              </ul>
            </div>

            <div className="tech-category">
              <h3>ML/AI</h3>
              <ul>
                <li>Statistical anomaly detection</li>
                <li>XGBoost for risk scoring</li>
                <li>Prophet for forecasting</li>
                <li>SHAP for explainability</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Supported Asset Types</h2>
          <div className="asset-types">
            <div className="asset-type">
              <span className="asset-icon">⚡</span>
              <span>Transformers</span>
            </div>
            <div className="asset-type">
              <span className="asset-icon">🔧</span>
              <span>Motors</span>
            </div>
            <div className="asset-type">
              <span className="asset-icon">⚙️</span>
              <span>Generators</span>
            </div>
            <div className="asset-type">
              <span className="asset-icon">💧</span>
              <span>Pumps</span>
            </div>
            <div className="asset-type">
              <span className="asset-icon">🌡️</span>
              <span>HVAC Systems</span>
            </div>
            <div className="asset-type">
              <span className="asset-icon">🏭</span>
              <span>Industrial Equipment</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Use Cases</h2>
          <div className="use-cases">
            <div className="use-case">
              <h3>Manufacturing Plants</h3>
              <p>Monitor critical production equipment to minimize downtime and optimize maintenance schedules.</p>
            </div>
            <div className="use-case">
              <h3>Power Generation</h3>
              <p>Ensure reliability of transformers, generators, and distribution equipment in power plants.</p>
            </div>
            <div className="use-case">
              <h3>Data Centers</h3>
              <p>Track HVAC systems, power distribution, and cooling infrastructure to prevent outages.</p>
            </div>
            <div className="use-case">
              <h3>Oil & Gas</h3>
              <p>Monitor pumps, compressors, and processing equipment in refineries and production facilities.</p>
            </div>
          </div>
        </section>

        <section className="about-section stats-section">
          <h2>Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">&lt; 200ms</div>
              <div className="stat-label">API Response Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">Sensor Types Supported</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30 Days</div>
              <div className="stat-label">Forecast Horizon</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Real-Time Monitoring</div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Contact & Support</h2>
          <p>
            For more information about OpsSight AI, technical support, or partnership opportunities, 
            please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> support@opssightai.com</p>
            <p><strong>Website:</strong> www.opssightai.com</p>
            <p><strong>Documentation:</strong> docs.opssightai.com</p>
          </div>
        </section>

        <section className="about-section version-section">
          <p className="version-info">
            <strong>Version:</strong> 1.0.0 (MVP) | <strong>Build Date:</strong> February 2026
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
