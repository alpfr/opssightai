import { Pool } from 'pg';
import { 
  MaintenanceSchedule, 
  WorkOrder, 
  MaintenanceHistory, 
  MaintenanceRecommendation,
  WorkOrderStatus,
  Technician
} from '../types/maintenance';
import { logger } from '../utils/logger';

export class MaintenanceService {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // ==================== Technicians ====================

  async getAllTechnicians(): Promise<Technician[]> {
    const query = 'SELECT * FROM technicians ORDER BY name';
    
    try {
      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapTechnicianRow(row));
    } catch (error) {
      logger.error('Error fetching technicians:', error);
      throw error;
    }
  }

  async getAvailableTechnicians(): Promise<Technician[]> {
    const query = "SELECT * FROM technicians WHERE availability_status = 'available' ORDER BY name";
    
    try {
      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapTechnicianRow(row));
    } catch (error) {
      logger.error('Error fetching available technicians:', error);
      throw error;
    }
  }

  // ==================== Maintenance Schedules ====================

  async createSchedule(schedule: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceSchedule> {
    const query = `
      INSERT INTO maintenance_schedules (
        asset_id, schedule_name, schedule_type, trigger_type, frequency,
        interval_value, interval_unit, usage_threshold, next_due_date,
        task_description, estimated_duration, required_parts,
        assigned_technician_id, priority, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      schedule.assetId,
      schedule.scheduleName,
      schedule.scheduleType,
      schedule.triggerType,
      schedule.frequency,
      schedule.intervalValue,
      schedule.intervalUnit,
      schedule.usageThreshold,
      schedule.nextDueDate,
      schedule.taskDescription,
      schedule.estimatedDuration,
      schedule.requiredParts ? JSON.stringify(schedule.requiredParts) : null,
      schedule.assignedTechnicianId,
      schedule.priority,
      schedule.isActive
    ];

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Created maintenance schedule for asset ${schedule.assetId}`);
      return this.mapScheduleRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating maintenance schedule:', error);
      throw error;
    }
  }

  async getSchedulesByAsset(assetId: string): Promise<MaintenanceSchedule[]> {
    const query = `
      SELECT * FROM maintenance_schedules 
      WHERE asset_id = $1 AND is_active = true
      ORDER BY next_due_date ASC
    `;

    try {
      const result = await this.pool.query(query, [assetId]);
      return result.rows.map(row => this.mapScheduleRow(row));
    } catch (error) {
      logger.error(`Error fetching schedules for asset ${assetId}:`, error);
      throw error;
    }
  }

  async getUpcomingSchedules(daysAhead: number = 30): Promise<MaintenanceSchedule[]> {
    const query = `
      SELECT ms.*, a.name as asset_name, a.type as asset_type
      FROM maintenance_schedules ms
      JOIN assets a ON ms.asset_id = a.id
      WHERE ms.next_due_date <= NOW() + INTERVAL '${daysAhead} days'
      AND ms.next_due_date >= NOW()
      AND ms.is_active = true
      ORDER BY ms.next_due_date ASC
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapScheduleRow(row));
    } catch (error) {
      logger.error('Error fetching upcoming schedules:', error);
      throw error;
    }
  }

  async getOverdueSchedules(): Promise<MaintenanceSchedule[]> {
    const query = `
      SELECT ms.*, a.name as asset_name, a.type as asset_type
      FROM maintenance_schedules ms
      JOIN assets a ON ms.asset_id = a.id
      WHERE ms.next_due_date < NOW()
      AND ms.is_active = true
      ORDER BY ms.next_due_date ASC
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows.map(row => this.mapScheduleRow(row));
    } catch (error) {
      logger.error('Error fetching overdue schedules:', error);
      throw error;
    }
  }

  async updateSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.nextDueDate !== undefined) {
      fields.push(`next_due_date = $${paramCount++}`);
      values.push(updates.nextDueDate);
    }
    if (updates.assignedTechnicianId !== undefined) {
      fields.push(`assigned_technician_id = $${paramCount++}`);
      values.push(updates.assignedTechnicianId);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(updates.priority);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE maintenance_schedules 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Updated maintenance schedule ${id}`);
      return this.mapScheduleRow(result.rows[0]);
    } catch (error) {
      logger.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  }

  // ==================== Work Orders ====================

  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> {
    const query = `
      INSERT INTO work_orders (
        asset_id, schedule_id, title, description, maintenance_type,
        priority, status, assigned_technician_id, estimated_duration,
        estimated_cost, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      workOrder.assetId,
      workOrder.scheduleId,
      workOrder.title,
      workOrder.description,
      workOrder.maintenanceType,
      workOrder.priority,
      workOrder.status,
      workOrder.assignedTechnicianId,
      workOrder.estimatedDuration,
      workOrder.estimatedCost,
      workOrder.createdBy
    ];

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Created work order for asset ${workOrder.assetId}`);
      return this.mapWorkOrderRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating work order:', error);
      throw error;
    }
  }

  async getWorkOrderById(id: string): Promise<WorkOrder | null> {
    const query = `
      SELECT wo.*, a.name as asset_name, t.name as technician_name
      FROM work_orders wo
      JOIN assets a ON wo.asset_id = a.id
      LEFT JOIN technicians t ON wo.assigned_technician_id = t.id
      WHERE wo.id = $1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapWorkOrderRow(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error fetching work order ${id}:`, error);
      throw error;
    }
  }

  async getWorkOrdersByAsset(assetId: string): Promise<WorkOrder[]> {
    const query = `
      SELECT wo.*, t.name as technician_name
      FROM work_orders wo
      LEFT JOIN technicians t ON wo.assigned_technician_id = t.id
      WHERE wo.asset_id = $1
      ORDER BY wo.created_at DESC
    `;

    try {
      const result = await this.pool.query(query, [assetId]);
      return result.rows.map(row => this.mapWorkOrderRow(row));
    } catch (error) {
      logger.error(`Error fetching work orders for asset ${assetId}:`, error);
      throw error;
    }
  }

  async getWorkOrdersByStatus(status: WorkOrderStatus): Promise<WorkOrder[]> {
    const query = `
      SELECT wo.*, a.name as asset_name, t.name as technician_name
      FROM work_orders wo
      JOIN assets a ON wo.asset_id = a.id
      LEFT JOIN technicians t ON wo.assigned_technician_id = t.id
      WHERE wo.status = $1
      ORDER BY wo.priority DESC, wo.created_at ASC
    `;

    try {
      const result = await this.pool.query(query, [status]);
      return result.rows.map(row => this.mapWorkOrderRow(row));
    } catch (error) {
      logger.error(`Error fetching work orders with status ${status}:`, error);
      throw error;
    }
  }

  async updateWorkOrderStatus(
    id: string, 
    status: WorkOrderStatus, 
    updates?: {
      startedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
      actualDuration?: number;
      actualCost?: number;
      completionNotes?: string;
    }
  ): Promise<WorkOrder> {
    const fields: string[] = ['status = $1'];
    const values: any[] = [status];
    let paramCount = 2;

    if (updates?.startedAt) {
      fields.push(`started_at = $${paramCount++}`);
      values.push(updates.startedAt);
    }
    if (updates?.completedAt) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(updates.completedAt);
    }
    if (updates?.cancelledAt) {
      fields.push(`cancelled_at = $${paramCount++}`);
      values.push(updates.cancelledAt);
    }
    if (updates?.actualDuration !== undefined) {
      fields.push(`actual_duration = $${paramCount++}`);
      values.push(updates.actualDuration);
    }
    if (updates?.actualCost !== undefined) {
      fields.push(`actual_cost = $${paramCount++}`);
      values.push(updates.actualCost);
    }
    if (updates?.completionNotes) {
      fields.push(`completion_notes = $${paramCount++}`);
      values.push(updates.completionNotes);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE work_orders 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Updated work order ${id} status to ${status}`);
      return this.mapWorkOrderRow(result.rows[0]);
    } catch (error) {
      logger.error(`Error updating work order ${id}:`, error);
      throw error;
    }
  }

  async assignWorkOrder(id: string, technicianId: string): Promise<WorkOrder> {
    const query = `
      UPDATE work_orders 
      SET assigned_technician_id = $1, 
          assigned_at = NOW(),
          status = CASE WHEN status = 'pending' THEN 'assigned' ELSE status END,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [technicianId, id]);
      logger.info(`Assigned work order ${id} to technician ${technicianId}`);
      return this.mapWorkOrderRow(result.rows[0]);
    } catch (error) {
      logger.error(`Error assigning work order ${id}:`, error);
      throw error;
    }
  }

  // ==================== Maintenance History ====================

  async createMaintenanceHistory(history: Omit<MaintenanceHistory, 'id' | 'createdAt'>): Promise<MaintenanceHistory> {
    const query = `
      INSERT INTO maintenance_history (
        asset_id, work_order_id, performed_at, maintenance_type,
        description, technician_id, duration, labor_cost, parts_cost,
        contractor_cost, other_cost, total_cost, parts_used, notes, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const totalCost = (history.laborCost || 0) + (history.partsCost || 0) + 
                     (history.contractorCost || 0) + (history.otherCost || 0);

    const values = [
      history.assetId,
      history.workOrderId,
      history.performedAt,
      history.maintenanceType,
      history.description,
      history.technicianId,
      history.duration,
      history.laborCost,
      history.partsCost,
      history.contractorCost,
      history.otherCost,
      totalCost,
      history.partsUsed ? JSON.stringify(history.partsUsed) : null,
      history.notes,
      history.attachments ? JSON.stringify(history.attachments) : null
    ];

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Created maintenance history for asset ${history.assetId}`);
      return this.mapHistoryRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating maintenance history:', error);
      throw error;
    }
  }

  async getMaintenanceHistory(assetId: string, limit: number = 50): Promise<MaintenanceHistory[]> {
    const query = `
      SELECT mh.*, t.name as technician_name
      FROM maintenance_history mh
      LEFT JOIN technicians t ON mh.technician_id = t.id
      WHERE mh.asset_id = $1
      ORDER BY mh.performed_at DESC
      LIMIT $2
    `;

    try {
      const result = await this.pool.query(query, [assetId, limit]);
      return result.rows.map(row => this.mapHistoryRow(row));
    } catch (error) {
      logger.error(`Error fetching maintenance history for asset ${assetId}:`, error);
      throw error;
    }
  }

  async getMaintenanceCostSummary(assetId: string, startDate: Date, endDate: Date) {
    const query = `
      SELECT 
        COUNT(*) as maintenance_count,
        SUM(total_cost) as total_cost,
        SUM(labor_cost) as labor_cost,
        SUM(parts_cost) as parts_cost,
        SUM(contractor_cost) as contractor_cost,
        SUM(other_cost) as other_cost,
        AVG(total_cost) as avg_cost_per_maintenance
      FROM maintenance_history
      WHERE asset_id = $1
      AND performed_at BETWEEN $2 AND $3
    `;

    try {
      const result = await this.pool.query(query, [assetId, startDate, endDate]);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error fetching cost summary for asset ${assetId}:`, error);
      throw error;
    }
  }

  // ==================== Maintenance Recommendations ====================

  async createRecommendation(recommendation: Omit<MaintenanceRecommendation, 'id' | 'generatedAt' | 'statusUpdatedAt'>): Promise<MaintenanceRecommendation> {
    const query = `
      INSERT INTO maintenance_recommendations (
        asset_id, recommendation_type, urgency, title, description,
        suggested_actions, estimated_cost, estimated_downtime,
        risk_if_deferred, status, related_anomaly_id, related_risk_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      recommendation.assetId,
      recommendation.recommendationType,
      recommendation.urgency,
      recommendation.title,
      recommendation.description,
      recommendation.suggestedActions,
      recommendation.estimatedCost,
      recommendation.estimatedDowntime,
      recommendation.riskIfDeferred,
      recommendation.status,
      recommendation.relatedAnomalyId,
      recommendation.relatedRiskScore
    ];

    try {
      const result = await this.pool.query(query, values);
      logger.info(`Created maintenance recommendation for asset ${recommendation.assetId}`);
      return this.mapRecommendationRow(result.rows[0]);
    } catch (error) {
      logger.error('Error creating maintenance recommendation:', error);
      throw error;
    }
  }

  async getRecommendationsByAsset(assetId: string): Promise<MaintenanceRecommendation[]> {
    const query = `
      SELECT * FROM maintenance_recommendations 
      WHERE asset_id = $1 AND status = 'pending'
      ORDER BY urgency DESC, generated_at DESC
    `;

    try {
      const result = await this.pool.query(query, [assetId]);
      return result.rows.map(row => this.mapRecommendationRow(row));
    } catch (error) {
      logger.error(`Error fetching recommendations for asset ${assetId}:`, error);
      throw error;
    }
  }

  async updateRecommendationStatus(
    id: string, 
    status: 'pending' | 'accepted' | 'deferred' | 'dismissed',
    updatedBy?: string,
    deferralReason?: string
  ): Promise<MaintenanceRecommendation> {
    const query = `
      UPDATE maintenance_recommendations 
      SET status = $1, 
          status_updated_at = NOW(),
          status_updated_by = $2,
          deferral_reason = $3
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [status, updatedBy, deferralReason, id]);
      logger.info(`Updated recommendation ${id} status to ${status}`);
      return this.mapRecommendationRow(result.rows[0]);
    } catch (error) {
      logger.error(`Error updating recommendation ${id}:`, error);
      throw error;
    }
  }

  // ==================== Helper Methods ====================

  private mapTechnicianRow(row: any): Technician {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      skills: row.skills,
      certifications: typeof row.certifications === 'string' ? JSON.parse(row.certifications) : row.certifications,
      availabilityStatus: row.availability_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapScheduleRow(row: any): MaintenanceSchedule {
    return {
      id: row.id,
      assetId: row.asset_id,
      scheduleName: row.schedule_name,
      scheduleType: row.schedule_type,
      triggerType: row.trigger_type,
      frequency: row.frequency,
      intervalValue: row.interval_value,
      intervalUnit: row.interval_unit,
      usageThreshold: row.usage_threshold,
      nextDueDate: row.next_due_date,
      taskDescription: row.task_description,
      estimatedDuration: row.estimated_duration,
      requiredParts: typeof row.required_parts === 'string' ? JSON.parse(row.required_parts) : row.required_parts,
      assignedTechnicianId: row.assigned_technician_id,
      priority: row.priority,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapWorkOrderRow(row: any): WorkOrder {
    return {
      id: row.id,
      workOrderNumber: row.work_order_number,
      assetId: row.asset_id,
      scheduleId: row.schedule_id,
      title: row.title,
      description: row.description,
      maintenanceType: row.maintenance_type,
      priority: row.priority,
      status: row.status,
      assignedTechnicianId: row.assigned_technician_id,
      estimatedDuration: row.estimated_duration,
      actualDuration: row.actual_duration,
      estimatedCost: parseFloat(row.estimated_cost),
      actualCost: row.actual_cost ? parseFloat(row.actual_cost) : undefined,
      createdAt: row.created_at,
      assignedAt: row.assigned_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      cancelledAt: row.cancelled_at,
      completionNotes: row.completion_notes,
      createdBy: row.created_by,
      updatedAt: row.updated_at
    };
  }

  private mapHistoryRow(row: any): MaintenanceHistory {
    return {
      id: row.id,
      assetId: row.asset_id,
      workOrderId: row.work_order_id,
      performedAt: row.performed_at,
      maintenanceType: row.maintenance_type,
      description: row.description,
      technicianId: row.technician_id,
      duration: row.duration,
      laborCost: row.labor_cost ? parseFloat(row.labor_cost) : undefined,
      partsCost: row.parts_cost ? parseFloat(row.parts_cost) : undefined,
      contractorCost: row.contractor_cost ? parseFloat(row.contractor_cost) : undefined,
      otherCost: row.other_cost ? parseFloat(row.other_cost) : undefined,
      totalCost: row.total_cost ? parseFloat(row.total_cost) : undefined,
      partsUsed: typeof row.parts_used === 'string' ? JSON.parse(row.parts_used) : row.parts_used,
      notes: row.notes,
      attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments,
      createdAt: row.created_at
    };
  }

  private mapRecommendationRow(row: any): MaintenanceRecommendation {
    return {
      id: row.id,
      assetId: row.asset_id,
      recommendationType: row.recommendation_type,
      urgency: row.urgency,
      title: row.title,
      description: row.description,
      suggestedActions: row.suggested_actions,
      estimatedCost: row.estimated_cost ? parseFloat(row.estimated_cost) : undefined,
      estimatedDowntime: row.estimated_downtime,
      riskIfDeferred: row.risk_if_deferred,
      generatedAt: row.generated_at,
      status: row.status,
      statusUpdatedAt: row.status_updated_at,
      statusUpdatedBy: row.status_updated_by,
      deferralReason: row.deferral_reason,
      relatedAnomalyId: row.related_anomaly_id,
      relatedRiskScore: row.related_risk_score ? parseFloat(row.related_risk_score) : undefined
    };
  }
}
