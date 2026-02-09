import { Pool } from 'pg';
import { logger } from '../utils/logger';

interface AssetRiskSummary {
  assetId: string;
  assetName: string;
  assetType: string;
  riskScore: number;
  status: string;
  location: string;
}

interface RiskDistribution {
  low: number;      // 0-30
  medium: number;   // 31-60
  high: number;     // 61-80
  critical: number; // 81-100
}

interface TrendingIssue {
  issueType: string;
  description: string;
  affectedAssetCount: number;
  severity: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  firstDetected: Date;
  lastDetected: Date;
}

interface ExecutiveSummary {
  plantId: string;
  generatedAt: Date;
  overallHealthScore: number;
  totalAssets: number;
  riskDistribution: RiskDistribution;
  criticalAnomalyCount: number;
  topRiskAssets: AssetRiskSummary[];
  trendingIssues: TrendingIssue[];
  recommendations: string[];
}

class ExecutiveSummaryService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async generateSummary(plantId: string): Promise<ExecutiveSummary> {
    try {
      logger.info(`Generating executive summary for plant ${plantId}`);

      // Fetch all assets for the plant
      const assets = await this.getPlantAssets(plantId);
      
      if (assets.length === 0) {
        throw new Error(`No assets found for plant ${plantId}`);
      }

      // Calculate overall health score (weighted average of risk scores)
      const overallHealthScore = this.calculateOverallHealthScore(assets);

      // Calculate risk distribution
      const riskDistribution = this.calculateRiskDistribution(assets);

      // Get critical anomaly count
      const criticalAnomalyCount = await this.getCriticalAnomalyCount(plantId);

      // Get top risk assets (top 10)
      const topRiskAssets = this.getTopRiskAssets(assets, 10);

      // Detect trending issues
      const trendingIssues = await this.detectTrendingIssues(plantId);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        overallHealthScore,
        riskDistribution,
        criticalAnomalyCount,
        trendingIssues
      );

      const summary: ExecutiveSummary = {
        plantId,
        generatedAt: new Date(),
        overallHealthScore,
        totalAssets: assets.length,
        riskDistribution,
        criticalAnomalyCount,
        topRiskAssets,
        trendingIssues,
        recommendations
      };

      // Store summary in database for historical tracking
      await this.storeSummary(summary);

      logger.info(`Executive summary generated for plant ${plantId}: Health Score ${overallHealthScore}`);

      return summary;
    } catch (error) {
      logger.error(`Error generating executive summary for plant ${plantId}:`, error);
      throw error;
    }
  }

  private async getPlantAssets(plantId: string): Promise<AssetRiskSummary[]> {
    const result = await this.pool.query(
      `SELECT 
        a.id as "assetId",
        a.name as "assetName",
        a.type as "assetType",
        COALESCE(a.current_risk_score, 0) as "riskScore",
        a.status,
        a.location->>'building' as location
       FROM assets a
       WHERE (a.location->>'plantId' = $1 OR a.plant_id = $1)
       AND a.status != 'decommissioned'
       ORDER BY a.current_risk_score DESC NULLS LAST`,
      [plantId]
    );

    return result.rows.map(row => ({
      assetId: row.assetId,
      assetName: row.assetName,
      assetType: row.assetType,
      riskScore: parseFloat(row.riskScore) || 0,
      status: row.status,
      location: row.location || 'Unknown'
    }));
  }

  private calculateOverallHealthScore(assets: AssetRiskSummary[]): number {
    if (assets.length === 0) return 100;

    // Calculate weighted average (inverse of risk score)
    // Health Score = 100 - Average Risk Score
    const totalRiskScore = assets.reduce((sum, asset) => sum + asset.riskScore, 0);
    const avgRiskScore = totalRiskScore / assets.length;
    const healthScore = 100 - avgRiskScore;

    return Math.round(healthScore * 10) / 10;
  }

  private calculateRiskDistribution(assets: AssetRiskSummary[]): RiskDistribution {
    const distribution: RiskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    assets.forEach(asset => {
      if (asset.riskScore <= 30) {
        distribution.low++;
      } else if (asset.riskScore <= 60) {
        distribution.medium++;
      } else if (asset.riskScore <= 80) {
        distribution.high++;
      } else {
        distribution.critical++;
      }
    });

    return distribution;
  }

  private async getCriticalAnomalyCount(plantId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count
       FROM anomalies an
       JOIN assets a ON an.asset_id = a.id
       WHERE (a.location->>'plantId' = $1 OR a.plant_id = $1)
       AND an.severity = 'critical'
       AND an.status = 'open'
       AND an.detected_at > NOW() - INTERVAL '7 days'`,
      [plantId]
    );

    return parseInt(result.rows[0].count) || 0;
  }

  private getTopRiskAssets(assets: AssetRiskSummary[], limit: number): AssetRiskSummary[] {
    return assets
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  private async detectTrendingIssues(plantId: string): Promise<TrendingIssue[]> {
    // Analyze anomaly patterns across multiple assets
    const result = await this.pool.query(
      `SELECT 
        an.metric as "issueType",
        an.severity,
        COUNT(DISTINCT an.asset_id) as "affectedAssetCount",
        MIN(an.detected_at) as "firstDetected",
        MAX(an.detected_at) as "lastDetected",
        COUNT(*) as "occurrenceCount"
       FROM anomalies an
       JOIN assets a ON an.asset_id = a.id
       WHERE (a.location->>'plantId' = $1 OR a.plant_id = $1)
       AND an.detected_at > NOW() - INTERVAL '30 days'
       AND an.status = 'open'
       GROUP BY an.metric, an.severity
       HAVING COUNT(DISTINCT an.asset_id) >= 2
       ORDER BY "affectedAssetCount" DESC, "occurrenceCount" DESC
       LIMIT 5`,
      [plantId]
    );

    return result.rows.map(row => {
      // Calculate trend based on recent vs older occurrences
      const trend = this.calculateTrend(row.firstDetected, row.lastDetected, row.occurrenceCount);

      return {
        issueType: row.issueType,
        description: this.generateIssueDescription(row.issueType, row.affectedAssetCount),
        affectedAssetCount: parseInt(row.affectedAssetCount),
        severity: row.severity,
        trend,
        firstDetected: new Date(row.firstDetected),
        lastDetected: new Date(row.lastDetected)
      };
    });
  }

  private calculateTrend(
    firstDetected: Date,
    lastDetected: Date,
    occurrenceCount: number
  ): 'increasing' | 'stable' | 'decreasing' {
    const timeSpan = new Date(lastDetected).getTime() - new Date(firstDetected).getTime();
    const days = timeSpan / (1000 * 60 * 60 * 24);

    if (days < 7) {
      // Recent issue, consider it increasing
      return 'increasing';
    }

    // Simple heuristic: if more than 1 occurrence per 3 days, it's increasing
    const occurrenceRate = occurrenceCount / days;
    
    if (occurrenceRate > 0.33) {
      return 'increasing';
    } else if (occurrenceRate > 0.1) {
      return 'stable';
    } else {
      return 'decreasing';
    }
  }

  private generateIssueDescription(issueType: string, affectedCount: number): string {
    const descriptions: { [key: string]: string } = {
      temperature: `Elevated temperature detected across ${affectedCount} assets`,
      voltage: `Voltage fluctuations affecting ${affectedCount} assets`,
      current: `Current anomalies observed in ${affectedCount} assets`,
      vibration: `Abnormal vibration patterns in ${affectedCount} assets`,
      pressure: `Pressure irregularities detected in ${affectedCount} assets`
    };

    return descriptions[issueType] || `${issueType} issues affecting ${affectedCount} assets`;
  }

  private generateRecommendations(
    healthScore: number,
    riskDistribution: RiskDistribution,
    criticalAnomalyCount: number,
    trendingIssues: TrendingIssue[]
  ): string[] {
    const recommendations: string[] = [];

    // Health score based recommendations
    if (healthScore < 50) {
      recommendations.push('URGENT: Plant health is critically low. Immediate action required across multiple assets.');
    } else if (healthScore < 70) {
      recommendations.push('Plant health requires attention. Schedule maintenance for high-risk assets.');
    } else if (healthScore < 85) {
      recommendations.push('Plant health is fair. Monitor high-risk assets closely.');
    } else {
      recommendations.push('Plant health is good. Continue regular monitoring and preventive maintenance.');
    }

    // Critical assets recommendations
    if (riskDistribution.critical > 0) {
      recommendations.push(`${riskDistribution.critical} asset(s) in critical risk state. Prioritize immediate inspection and maintenance.`);
    }

    if (riskDistribution.high > 0) {
      recommendations.push(`${riskDistribution.high} asset(s) at high risk. Schedule maintenance within the next week.`);
    }

    // Anomaly based recommendations
    if (criticalAnomalyCount > 5) {
      recommendations.push(`${criticalAnomalyCount} critical anomalies detected in the past week. Review and address immediately.`);
    } else if (criticalAnomalyCount > 0) {
      recommendations.push(`${criticalAnomalyCount} critical anomaly(ies) require attention.`);
    }

    // Trending issues recommendations
    if (trendingIssues.length > 0) {
      const increasingIssues = trendingIssues.filter(i => i.trend === 'increasing');
      if (increasingIssues.length > 0) {
        const topIssue = increasingIssues[0];
        recommendations.push(`Trending issue: ${topIssue.description}. Investigate root cause to prevent escalation.`);
      }
    }

    // General recommendations
    if (recommendations.length === 1) {
      recommendations.push('Maintain current monitoring schedule and preventive maintenance practices.');
    }

    return recommendations;
  }

  private async storeSummary(summary: ExecutiveSummary): Promise<void> {
    await this.pool.query(
      `INSERT INTO executive_summaries 
       (plant_id, generated_at, overall_health_score, total_assets, risk_distribution, 
        critical_anomaly_count, top_risk_assets, trending_issues, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        summary.plantId,
        summary.generatedAt,
        summary.overallHealthScore,
        summary.totalAssets,
        JSON.stringify(summary.riskDistribution),
        summary.criticalAnomalyCount,
        JSON.stringify(summary.topRiskAssets),
        JSON.stringify(summary.trendingIssues),
        JSON.stringify(summary.recommendations)
      ]
    );
  }

  async getSummaryHistory(plantId: string, limit: number = 30): Promise<ExecutiveSummary[]> {
    const result = await this.pool.query(
      `SELECT 
        plant_id as "plantId",
        generated_at as "generatedAt",
        overall_health_score as "overallHealthScore",
        total_assets as "totalAssets",
        risk_distribution as "riskDistribution",
        critical_anomaly_count as "criticalAnomalyCount",
        top_risk_assets as "topRiskAssets",
        trending_issues as "trendingIssues",
        recommendations
       FROM executive_summaries
       WHERE plant_id = $1
       ORDER BY generated_at DESC
       LIMIT $2`,
      [plantId, limit]
    );

    return result.rows.map(row => ({
      plantId: row.plantId,
      generatedAt: new Date(row.generatedAt),
      overallHealthScore: parseFloat(row.overallHealthScore),
      totalAssets: parseInt(row.totalAssets),
      riskDistribution: row.riskDistribution,
      criticalAnomalyCount: parseInt(row.criticalAnomalyCount),
      topRiskAssets: row.topRiskAssets,
      trendingIssues: row.trendingIssues,
      recommendations: row.recommendations
    }));
  }
}

export { ExecutiveSummaryService, ExecutiveSummary, AssetRiskSummary, TrendingIssue, RiskDistribution };
