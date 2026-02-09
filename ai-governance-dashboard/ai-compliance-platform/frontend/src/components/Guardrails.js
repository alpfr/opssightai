/**
 * Guardrails Component for AI Compliance Platform - Enhanced with LLM Assessment
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PlayArrow as TestIcon,
  Security as SecurityIcon,
  Psychology as ModelIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import ModelSelectionDropdown from './ModelSelectionDropdown';

export default function Guardrails() {
  const { getGuardrails, createGuardrail, updateGuardrail, filterContent } = useApi();
  
  const [guardrails, setGuardrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingGuardrail, setEditingGuardrail] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'pii_protection',
    pattern: '',
    action: 'block',
    is_active: true,
    industry_profile: 'financial_services'
  });
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  
  // New state for LLM assessment
  const [selectedModelId, setSelectedModelId] = useState('');
  const [industryProfile, setIndustryProfile] = useState('financial_services');

  useEffect(() => {
    loadGuardrails();
  }, []);

  const loadGuardrails = async () => {
    setLoading(true);
    const result = await getGuardrails();
    
    if (result.success) {
      setGuardrails(result.data);
      setError('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleOpenDialog = (guardrail = null) => {
    if (guardrail) {
      setEditingGuardrail(guardrail);
      setFormData({
        name: guardrail.name,
        rule_type: guardrail.rule_type,
        pattern: guardrail.pattern,
        action: guardrail.action,
        is_active: guardrail.is_active,
        industry_profile: guardrail.industry_profile
      });
    } else {
      setEditingGuardrail(null);
      setFormData({
        name: '',
        rule_type: 'pii_protection',
        pattern: '',
        action: 'block',
        is_active: true,
        industry_profile: 'financial_services'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGuardrail(null);
    setError('');
  };

  const handleSubmit = async () => {
    let result;
    
    if (editingGuardrail) {
      // Update existing guardrail
      result = await updateGuardrail(editingGuardrail.id, formData);
    } else {
      // Create new guardrail
      result = await createGuardrail(formData);
    }

    if (result.success) {
      handleCloseDialog();
      loadGuardrails();
    } else {
      setError(result.error);
    }
  };

  const handleTestContent = async () => {
    if (!testContent.trim()) return;
    
    setTestLoading(true);
    const result = await filterContent(
      testContent, 
      {}, 
      industryProfile, 
      'US', 
      selectedModelId || null  // Include model ID for LLM assessment
    );
    
    if (result.success) {
      setTestResult(result.data);
    } else {
      setError(result.error);
    }
    
    setTestLoading(false);
  };

  const getRuleTypeColor = (type) => {
    switch (type) {
      case 'pii_protection':
        return 'error';
      case 'regulatory_language':
        return 'warning';
      case 'bias_check':
        return 'info';
      default:
        return 'default';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'block':
        return 'error';
      case 'flag':
        return 'warning';
      case 'escalate':
        return 'info';
      default:
        return 'default';
    }
  };

  const samplePatterns = {
    pii_protection: {
      'SSN': '\\b\\d{3}-\\d{2}-\\d{4}\\b',
      'Credit Card': '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
      'Email': '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      'Phone': '\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b'
    },
    regulatory_language: {
      'Investment Advice': '\\b(guaranteed returns|risk-free investment|sure profit)\\b',
      'Medical Claims': '\\b(cure|treat|diagnose)\\b.*\\b(cancer|diabetes|disease)\\b',
      'Financial Promises': '\\b(guaranteed|promise|ensure)\\b.*\\b(profit|return|income)\\b'
    },
    bias_check: {
      'Gender Bias': '\\b(he|she)\\b.*\\b(should|must|always)\\b',
      'Age Discrimination': '\\b(too old|too young|age limit)\\b',
      'Racial Terms': '\\b(race|ethnicity)\\b.*\\b(better|worse|superior)\\b'
    }
  };

  if (loading) {
    return (
      <Box className="main-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="main-content">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            AI Guardrails & LLM Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Test content compliance against guardrail rules and assess different AI language models
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={() => setTestDialogOpen(true)}
            size="large"
            color="primary"
            sx={{ minWidth: '200px' }}
          >
            Test LLM & Content
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Guardrail
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Active Guardrails ({guardrails.filter(g => g.is_active).length})
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Real-time content filtering rules and AI model assessment capabilities to ensure outputs comply with regulations
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<SecurityIcon />}
                  label="Guardrail Rules" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<ModelIcon />}
                  label="LLM Assessment" 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${guardrails.filter(g => g.industry_profile === 'financial_services').length} Financial Rules`}
                  size="small" 
                />
                <Chip 
                  label={`${guardrails.filter(g => g.industry_profile === 'healthcare').length} Healthcare Rules`}
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Pattern</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {guardrails.map((guardrail) => (
                  <TableRow key={guardrail.id}>
                    <TableCell>{guardrail.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={guardrail.rule_type.replace('_', ' ').toUpperCase()}
                        color={getRuleTypeColor(guardrail.rule_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', maxWidth: 200 }}>
                        {guardrail.pattern.length > 50 
                          ? `${guardrail.pattern.substring(0, 50)}...` 
                          : guardrail.pattern
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={guardrail.action.toUpperCase()}
                        color={getActionColor(guardrail.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{guardrail.industry_profile}</TableCell>
                    <TableCell>
                      <Chip
                        label={guardrail.is_active ? 'ACTIVE' : 'INACTIVE'}
                        color={guardrail.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(guardrail)}
                        title="Edit Guardrail"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {guardrails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No guardrails configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Guardrail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGuardrail ? 'Edit Guardrail' : 'Create New Guardrail'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., PII Protection - SSN"
            />

            <FormControl fullWidth>
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={formData.rule_type}
                label="Rule Type"
                onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
              >
                <MenuItem value="pii_protection">PII Protection</MenuItem>
                <MenuItem value="regulatory_language">Regulatory Language</MenuItem>
                <MenuItem value="bias_check">Bias Check</MenuItem>
                <MenuItem value="safety_constraint">Safety Constraint</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Regex Pattern"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              placeholder="Enter regex pattern"
              multiline
              rows={2}
              helperText="Regular expression pattern to match content"
            />

            {/* Sample patterns */}
            {samplePatterns[formData.rule_type] && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Sample patterns:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(samplePatterns[formData.rule_type]).map(([name, pattern]) => (
                    <Button
                      key={name}
                      size="small"
                      variant="outlined"
                      onClick={() => setFormData({ ...formData, pattern, name: `${formData.rule_type.replace('_', ' ')} - ${name}` })}
                    >
                      {name}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={formData.action}
                label="Action"
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              >
                <MenuItem value="block">Block (Replace with [REDACTED])</MenuItem>
                <MenuItem value="flag">Flag (Log but allow)</MenuItem>
                <MenuItem value="escalate">Escalate (Block and notify)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Industry Profile</InputLabel>
              <Select
                value={formData.industry_profile}
                label="Industry Profile"
                onChange={(e) => setFormData({ ...formData, industry_profile: e.target.value })}
              >
                <MenuItem value="financial_services">Financial Services</MenuItem>
                <MenuItem value="healthcare">Healthcare</MenuItem>
                <MenuItem value="automotive">Automotive</MenuItem>
                <MenuItem value="government">Government</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGuardrail ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Content Dialog - Enhanced with LLM Assessment */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ModelIcon color="primary" />
            LLM Assessment & Content Filtering
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            
            {/* Industry Profile Selection */}
            <FormControl fullWidth>
              <InputLabel>Industry Profile</InputLabel>
              <Select
                value={industryProfile}
                label="Industry Profile"
                onChange={(e) => {
                  setIndustryProfile(e.target.value);
                  setSelectedModelId(''); // Reset model selection when industry changes
                }}
              >
                <MenuItem value="financial_services">Financial Services</MenuItem>
                <MenuItem value="healthcare">Healthcare</MenuItem>
                <MenuItem value="automotive">Automotive</MenuItem>
                <MenuItem value="government">Government</MenuItem>
              </Select>
            </FormControl>

            {/* Model Selection Dropdown */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ModelIcon fontSize="small" />
                Select AI Model for Assessment
              </Typography>
              <ModelSelectionDropdown
                selectedModelId={selectedModelId}
                onModelChange={setSelectedModelId}
                industryProfile={industryProfile}
                showModelInfo={true}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Choose an AI model to test compliance against. Leave empty to test guardrails only.
              </Typography>
            </Box>

            <Divider />

            {/* Test Content Input */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Content to Test
              </Typography>
              <TextField
                fullWidth
                label="Enter content for compliance testing"
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                multiline
                rows={4}
                placeholder="Enter content to test against guardrails and AI model compliance..."
                helperText="This content will be analyzed for compliance violations using the selected guardrail rules and AI model."
              />
            </Box>
            
            <Button
              variant="contained"
              onClick={handleTestContent}
              disabled={testLoading || !testContent.trim()}
              startIcon={testLoading ? <CircularProgress size={20} /> : <TestIcon />}
              size="large"
            >
              {testLoading ? 'Testing...' : 'Run Compliance Test'}
            </Button>

            {testResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color={testResult.is_compliant ? 'success' : 'error'} />
                  Compliance Test Results
                </Typography>
                
                {/* Compliance Status */}
                <Alert severity={testResult.is_compliant ? 'success' : 'error'} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Content is {testResult.is_compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </Typography>
                    {testResult.model_used && (
                      <Chip 
                        label={`Tested with: ${testResult.model_info?.name || testResult.model_used}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Alert>

                {/* Model Information */}
                {testResult.model_info && (
                  <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        AI Model Assessment Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption">Model:</Typography>
                          <Typography variant="body2">{testResult.model_info.name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Provider:</Typography>
                          <Typography variant="body2">{testResult.model_info.provider}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Version:</Typography>
                          <Typography variant="body2">{testResult.model_info.version}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Industry:</Typography>
                          <Typography variant="body2">{industryProfile.replace('_', ' ')}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Filtered Content */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Processed Content:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {testResult.filtered_content}
                    </Typography>
                  </Paper>
                </Box>

                {/* Violations */}
                {testResult.violations.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compliance Violations ({testResult.violations.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {testResult.violations.map((violation, index) => (
                        <Alert key={index} severity="warning" sx={{ py: 0.5 }}>
                          <Typography variant="body2">{violation}</Typography>
                        </Alert>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Applied Rules */}
                {testResult.applied_rules.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Applied Guardrail Rules ({testResult.applied_rules.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {testResult.applied_rules.map((rule, index) => (
                        <Chip 
                          key={index} 
                          label={rule} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* No violations message */}
                {testResult.violations.length === 0 && testResult.applied_rules.length === 0 && (
                  <Alert severity="info">
                    No guardrail rules were triggered. The content appears to be compliant with current policies.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setTestContent('');
              setTestResult(null);
              setSelectedModelId('');
            }}
            variant="outlined"
          >
            Reset Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}