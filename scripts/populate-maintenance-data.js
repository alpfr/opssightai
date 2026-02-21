const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Sample data
const assets = [
  { id: '7e259984-0b48-48dc-b706-5045de3db523', name: 'Generator G1', type: 'generator' },
  { id: 'f2756364-b0df-4247-8d3d-1a49e74196cb', name: 'Main Transformer T1', type: 'transformer' },
  { id: '6e997ace-1e69-4e8b-9f9d-dcd34e6720a2', name: 'Motor M1', type: 'motor' },
  { id: '98724d0f-77ee-4978-a1d4-ba406b362e97', name: 'Pump P1', type: 'pump' }
];

const technicians = [
  { id: '606d038c-0332-41ff-8976-ef54dc1e02a4', name: 'John Smith' },
  { id: '0ddd54db-7670-44fb-a6ee-e32d126c9a22', name: 'Maria Garcia' },
  { id: '5d2ba74c-3b06-4d18-a564-6d78b9d24919', name: 'David Chen' }
];

async function createMaintenanceSchedules() {
  console.log('Creating maintenance schedules...\n');

  const schedules = [
    {
      assetId: assets[0].id, // Generator G1
      scheduleName: 'Quarterly Generator Inspection',
      scheduleType: 'preventive',
      triggerType: 'time_based',
      frequency: 'quarterly',
      intervalValue: 3,
      intervalUnit: 'months',
      nextDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      taskDescription: 'Comprehensive generator inspection including oil levels, filters, and electrical connections',
      estimatedDuration: 180, // 3 hours
      assignedTechnicianId: technicians[0].id,
      priority: 'high',
      isActive: true,
      requiredParts: {
        'oil_filter': 2,
        'air_filter': 1,
        'spark_plugs': 4
      }
    },
    {
      assetId: assets[1].id, // Transformer T1
      scheduleName: 'Annual Transformer Maintenance',
      scheduleType: 'preventive',
      triggerType: 'time_based',
      frequency: 'annual',
      intervalValue: 12,
      intervalUnit: 'months',
      nextDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
      taskDescription: 'Annual transformer oil analysis, insulation testing, and cooling system check',
      estimatedDuration: 240, // 4 hours
      assignedTechnicianId: technicians[2].id,
      priority: 'critical',
      isActive: true,
      requiredParts: {
        'transformer_oil': 50,
        'gaskets': 3
      }
    },
    {
      assetId: assets[2].id, // Motor M1
      scheduleName: 'Monthly Motor Inspection',
      scheduleType: 'preventive',
      triggerType: 'time_based',
      frequency: 'monthly',
      intervalValue: 1,
      intervalUnit: 'months',
      nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      taskDescription: 'Motor bearing lubrication, vibration analysis, and temperature monitoring',
      estimatedDuration: 90, // 1.5 hours
      assignedTechnicianId: technicians[1].id,
      priority: 'medium',
      isActive: true,
      requiredParts: {
        'bearing_grease': 2,
        'cleaning_supplies': 1
      }
    },
    {
      assetId: assets[3].id, // Pump P1
      scheduleName: 'Weekly Pump Check',
      scheduleType: 'preventive',
      triggerType: 'time_based',
      frequency: 'weekly',
      intervalValue: 1,
      intervalUnit: 'weeks',
      nextDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      taskDescription: 'Pump seal inspection, pressure check, and flow rate verification',
      estimatedDuration: 60, // 1 hour
      assignedTechnicianId: technicians[1].id,
      priority: 'medium',
      isActive: true,
      requiredParts: {
        'pump_seals': 2,
        'o_rings': 5
      }
    }
  ];

  for (const schedule of schedules) {
    try {
      const response = await axios.post(`${API_BASE}/maintenance/schedules`, schedule);
      console.log(`✅ Created schedule: ${schedule.scheduleName}`);
      console.log(`   Asset: ${assets.find(a => a.id === schedule.assetId).name}`);
      console.log(`   Next Due: ${new Date(schedule.nextDueDate).toLocaleDateString()}`);
      console.log(`   Priority: ${schedule.priority}\n`);
    } catch (error) {
      console.error(`❌ Failed to create schedule: ${schedule.scheduleName}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}\n`);
    }
  }
}

async function createWorkOrders() {
  console.log('\nCreating work orders...\n');

  const workOrders = [
    {
      assetId: assets[1].id, // Transformer T1 (overdue maintenance)
      title: 'Overdue Transformer Maintenance',
      description: 'Critical transformer maintenance is overdue. Requires immediate attention.',
      maintenanceType: 'preventive',
      priority: 'critical',
      status: 'pending',
      assignedTechnicianId: technicians[2].id,
      estimatedDuration: 240,
      estimatedCost: 1500.00
    },
    {
      assetId: assets[0].id, // Generator G1
      title: 'Generator Oil Change',
      description: 'Routine oil change and filter replacement for Generator G1',
      maintenanceType: 'preventive',
      priority: 'high',
      status: 'assigned',
      assignedTechnicianId: technicians[0].id,
      estimatedDuration: 120,
      estimatedCost: 450.00
    },
    {
      assetId: assets[2].id, // Motor M1
      title: 'Motor Bearing Replacement',
      description: 'Replace worn bearings detected during vibration analysis',
      maintenanceType: 'corrective',
      priority: 'high',
      status: 'in_progress',
      assignedTechnicianId: technicians[1].id,
      estimatedDuration: 180,
      estimatedCost: 800.00
    }
  ];

  for (const workOrder of workOrders) {
    try {
      const response = await axios.post(`${API_BASE}/maintenance/work-orders`, workOrder);
      console.log(`✅ Created work order: ${workOrder.title}`);
      console.log(`   Asset: ${assets.find(a => a.id === workOrder.assetId).name}`);
      console.log(`   Status: ${workOrder.status}`);
      console.log(`   Priority: ${workOrder.priority}\n`);
    } catch (error) {
      console.error(`❌ Failed to create work order: ${workOrder.title}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}\n`);
    }
  }
}

async function createMaintenanceHistory() {
  console.log('\nCreating maintenance history...\n');

  const historyEntries = [
    {
      assetId: assets[0].id, // Generator G1
      performedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      maintenanceType: 'preventive',
      description: 'Quarterly generator inspection completed',
      technicianId: technicians[0].id,
      duration: 180,
      laborCost: 450.00,
      partsCost: 125.00,
      contractorCost: 0,
      otherCost: 25.00,
      partsUsed: {
        'oil_filter': 2,
        'air_filter': 1
      },
      notes: 'All systems operating normally. Replaced filters as scheduled.'
    },
    {
      assetId: assets[3].id, // Pump P1
      performedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      maintenanceType: 'preventive',
      description: 'Weekly pump inspection',
      technicianId: technicians[1].id,
      duration: 60,
      laborCost: 150.00,
      partsCost: 45.00,
      contractorCost: 0,
      otherCost: 10.00,
      partsUsed: {
        'pump_seals': 1,
        'o_rings': 3
      },
      notes: 'Minor seal wear detected. Replaced preventively.'
    },
    {
      assetId: assets[2].id, // Motor M1
      performedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      maintenanceType: 'corrective',
      description: 'Emergency motor repair - overheating issue',
      technicianId: technicians[1].id,
      duration: 300,
      laborCost: 750.00,
      partsCost: 450.00,
      contractorCost: 200.00,
      otherCost: 50.00,
      partsUsed: {
        'cooling_fan': 1,
        'thermal_sensor': 2,
        'wiring': 1
      },
      notes: 'Cooling fan failure caused overheating. Replaced fan and sensors. Motor tested and operating within normal parameters.'
    }
  ];

  for (const entry of historyEntries) {
    try {
      const response = await axios.post(`${API_BASE}/maintenance/history`, entry);
      console.log(`✅ Created history entry: ${entry.description}`);
      console.log(`   Asset: ${assets.find(a => a.id === entry.assetId).name}`);
      console.log(`   Date: ${new Date(entry.performedAt).toLocaleDateString()}`);
      console.log(`   Total Cost: $${entry.laborCost + entry.partsCost + entry.contractorCost + entry.otherCost}\n`);
    } catch (error) {
      console.error(`❌ Failed to create history entry: ${entry.description}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}\n`);
    }
  }
}

async function createRecommendations() {
  console.log('\nCreating maintenance recommendations...\n');

  const recommendations = [
    {
      assetId: assets[1].id, // Transformer T1
      recommendationType: 'risk_based',
      urgency: 'critical',
      title: 'Immediate Transformer Oil Analysis Required',
      description: 'Transformer oil analysis is overdue by 2 days. Degraded oil can lead to insulation failure and catastrophic equipment damage.',
      suggestedActions: 'Schedule immediate oil sampling and analysis. Consider temporary load reduction until maintenance is completed.',
      estimatedCost: 1500.00,
      estimatedDowntime: 240,
      riskIfDeferred: 'High risk of transformer failure, potential fire hazard, and extended downtime (3-5 days) if catastrophic failure occurs.',
      status: 'pending',
      relatedRiskScore: 85.5
    },
    {
      assetId: assets[2].id, // Motor M1
      recommendationType: 'predictive',
      urgency: 'medium',
      title: 'Motor Bearing Replacement Recommended',
      description: 'Vibration analysis indicates early bearing wear. Current vibration levels are 15% above baseline.',
      suggestedActions: 'Schedule bearing replacement during next planned maintenance window. Monitor vibration levels weekly.',
      estimatedCost: 800.00,
      estimatedDowntime: 180,
      riskIfDeferred: 'Continued operation may lead to bearing failure, resulting in unplanned downtime and potential motor damage.',
      status: 'pending',
      relatedRiskScore: 62.3
    },
    {
      assetId: assets[3].id, // Pump P1
      recommendationType: 'anomaly_based',
      urgency: 'low',
      title: 'Pump Efficiency Optimization',
      description: 'Pump efficiency has decreased by 8% over the past 3 months. Flow rate is within acceptable range but trending downward.',
      suggestedActions: 'Perform impeller inspection and cleaning. Check for cavitation or wear. Consider impeller replacement if wear is significant.',
      estimatedCost: 350.00,
      estimatedDowntime: 90,
      riskIfDeferred: 'Gradual efficiency loss will increase energy costs. No immediate safety risk.',
      status: 'pending',
      relatedRiskScore: 35.7
    }
  ];

  for (const recommendation of recommendations) {
    try {
      const response = await axios.post(`${API_BASE}/maintenance/recommendations`, recommendation);
      console.log(`✅ Created recommendation: ${recommendation.title}`);
      console.log(`   Asset: ${assets.find(a => a.id === recommendation.assetId).name}`);
      console.log(`   Urgency: ${recommendation.urgency}`);
      console.log(`   Estimated Cost: $${recommendation.estimatedCost}\n`);
    } catch (error) {
      console.error(`❌ Failed to create recommendation: ${recommendation.title}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}\n`);
    }
  }
}

async function main() {
  console.log('🔧 Populating OpsSightAI Maintenance Data\n');
  console.log('==========================================\n');

  try {
    await createMaintenanceSchedules();
    await createWorkOrders();
    await createMaintenanceHistory();
    await createRecommendations();

    console.log('\n✅ All maintenance data populated successfully!');
    console.log('\nYou can now:');
    console.log('  - View upcoming schedules: GET /api/maintenance/schedules/upcoming');
    console.log('  - View overdue schedules: GET /api/maintenance/schedules/overdue');
    console.log('  - View work orders: GET /api/maintenance/work-orders/status/pending');
    console.log('  - View maintenance history: GET /api/maintenance/history/asset/{assetId}');
    console.log('  - View recommendations: GET /api/maintenance/recommendations/asset/{assetId}');
  } catch (error) {
    console.error('\n❌ Error populating maintenance data:', error.message);
    process.exit(1);
  }
}

main();
