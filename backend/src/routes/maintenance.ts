import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { MaintenanceService } from '../services/maintenanceService';
import { logger } from '../utils/logger';

const router = Router();
const maintenanceService = new MaintenanceService(pool);

  // ==================== Technicians ====================

  // Get all technicians
  router.get('/technicians', async (req: Request, res: Response) => {
    try {
      const technicians = await maintenanceService.getAllTechnicians();
      res.json({ success: true, technicians, count: technicians.length });
    } catch (error) {
      logger.error('Error fetching technicians:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch technicians' });
    }
  });

  // Get available technicians
  router.get('/technicians/available', async (req: Request, res: Response) => {
    try {
      const technicians = await maintenanceService.getAvailableTechnicians();
      res.json({ success: true, technicians, count: technicians.length });
    } catch (error) {
      logger.error('Error fetching available technicians:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch available technicians' });
    }
  });

  // ==================== Maintenance Schedules ====================

  // Create a new maintenance schedule
  router.post('/schedules', async (req: Request, res: Response) => {
    try {
      const schedule = await maintenanceService.createSchedule(req.body);
      res.status(201).json({ success: true, schedule });
    } catch (error) {
      logger.error('Error creating maintenance schedule:', error);
      res.status(500).json({ success: false, error: 'Failed to create maintenance schedule' });
    }
  });

  // Get maintenance schedules for an asset
  router.get('/schedules/asset/:assetId', async (req: Request, res: Response) => {
    try {
      const schedules = await maintenanceService.getSchedulesByAsset(req.params.assetId);
      res.json({ success: true, schedules });
    } catch (error) {
      logger.error('Error fetching maintenance schedules:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch maintenance schedules' });
    }
  });

  // Get upcoming maintenance schedules
  router.get('/schedules/upcoming', async (req: Request, res: Response) => {
    try {
      const daysAhead = parseInt(req.query.days as string) || 30;
      const schedules = await maintenanceService.getUpcomingSchedules(daysAhead);
      res.json({ success: true, schedules, count: schedules.length });
    } catch (error) {
      logger.error('Error fetching upcoming schedules:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch upcoming schedules' });
    }
  });

  // Get overdue maintenance schedules
  router.get('/schedules/overdue', async (req: Request, res: Response) => {
    try {
      const schedules = await maintenanceService.getOverdueSchedules();
      res.json({ success: true, schedules, count: schedules.length });
    } catch (error) {
      logger.error('Error fetching overdue schedules:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch overdue schedules' });
    }
  });

  // ==================== Work Orders ====================

  // Create a new work order
  router.post('/work-orders', async (req: Request, res: Response) => {
    try {
      const workOrder = await maintenanceService.createWorkOrder(req.body);
      res.status(201).json({ success: true, workOrder });
    } catch (error) {
      logger.error('Error creating work order:', error);
      res.status(500).json({ success: false, error: 'Failed to create work order' });
    }
  });

  // Get work order by ID
  router.get('/work-orders/:id', async (req: Request, res: Response) => {
    try {
      const workOrder = await maintenanceService.getWorkOrderById(req.params.id);
      if (!workOrder) {
        return res.status(404).json({ success: false, error: 'Work order not found' });
      }
      res.json({ success: true, workOrder });
    } catch (error) {
      logger.error('Error fetching work order:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch work order' });
    }
  });

  // Get work orders for an asset
  router.get('/work-orders/asset/:assetId', async (req: Request, res: Response) => {
    try {
      const workOrders = await maintenanceService.getWorkOrdersByAsset(req.params.assetId);
      res.json({ success: true, workOrders, count: workOrders.length });
    } catch (error) {
      logger.error('Error fetching work orders:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch work orders' });
    }
  });

  // Get work orders by status
  router.get('/work-orders/status/:status', async (req: Request, res: Response) => {
    try {
      const workOrders = await maintenanceService.getWorkOrdersByStatus(req.params.status as any);
      res.json({ success: true, workOrders, count: workOrders.length });
    } catch (error) {
      logger.error('Error fetching work orders by status:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch work orders' });
    }
  });

  // Update work order status
  router.put('/work-orders/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, startedAt, completedAt, cancelledAt, actualDuration, actualCost, completionNotes } = req.body;
      const workOrder = await maintenanceService.updateWorkOrderStatus(
        req.params.id,
        status,
        { startedAt, completedAt, cancelledAt, actualDuration, actualCost, completionNotes }
      );
      res.json({ success: true, workOrder });
    } catch (error) {
      logger.error('Error updating work order status:', error);
      res.status(500).json({ success: false, error: 'Failed to update work order status' });
    }
  });

  // Assign work order to technician
  router.put('/work-orders/:id/assign', async (req: Request, res: Response) => {
    try {
      const { technicianId } = req.body;
      const workOrder = await maintenanceService.assignWorkOrder(req.params.id, technicianId);
      res.json({ success: true, workOrder });
    } catch (error) {
      logger.error('Error assigning work order:', error);
      res.status(500).json({ success: false, error: 'Failed to assign work order' });
    }
  });

  // ==================== Maintenance History ====================

  // Create maintenance history entry
  router.post('/history', async (req: Request, res: Response) => {
    try {
      const history = await maintenanceService.createMaintenanceHistory(req.body);
      res.status(201).json({ success: true, history });
    } catch (error) {
      logger.error('Error creating maintenance history:', error);
      res.status(500).json({ success: false, error: 'Failed to create maintenance history' });
    }
  });

  // Get maintenance history for an asset
  router.get('/history/asset/:assetId', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await maintenanceService.getMaintenanceHistory(req.params.assetId, limit);
      res.json({ success: true, history, count: history.length });
    } catch (error) {
      logger.error('Error fetching maintenance history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch maintenance history' });
    }
  });

  // Get maintenance cost summary
  router.get('/history/asset/:assetId/cost-summary', async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const summary = await maintenanceService.getMaintenanceCostSummary(req.params.assetId, startDate, endDate);
      res.json({ success: true, summary });
    } catch (error) {
      logger.error('Error fetching cost summary:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch cost summary' });
    }
  });

  // ==================== Maintenance Recommendations ====================

  // Create maintenance recommendation
  router.post('/recommendations', async (req: Request, res: Response) => {
    try {
      const recommendation = await maintenanceService.createRecommendation(req.body);
      res.status(201).json({ success: true, recommendation });
    } catch (error) {
      logger.error('Error creating maintenance recommendation:', error);
      res.status(500).json({ success: false, error: 'Failed to create maintenance recommendation' });
    }
  });

  // Get recommendations for an asset
  router.get('/recommendations/asset/:assetId', async (req: Request, res: Response) => {
    try {
      const recommendations = await maintenanceService.getRecommendationsByAsset(req.params.assetId);
      res.json({ success: true, recommendations, count: recommendations.length });
    } catch (error) {
      logger.error('Error fetching maintenance recommendations:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch maintenance recommendations' });
    }
  });

  // Update recommendation status
  router.put('/recommendations/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, updatedBy, deferralReason } = req.body;
      const recommendation = await maintenanceService.updateRecommendationStatus(
        req.params.id, 
        status, 
        updatedBy, 
        deferralReason
      );
      res.json({ success: true, recommendation });
    } catch (error) {
      logger.error('Error updating recommendation status:', error);
      res.status(500).json({ success: false, error: 'Failed to update recommendation status' });
    }
  });

export default router;
