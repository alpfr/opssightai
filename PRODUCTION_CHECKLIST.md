# OpsSight AI - Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Infrastructure
- [ ] Production server provisioned (min 4GB RAM, 2 CPU cores)
- [ ] Domain name configured and DNS propagated
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] Firewall rules configured
- [ ] Backup storage configured
- [ ] Monitoring tools installed

### Database
- [ ] PostgreSQL 14+ with TimescaleDB installed
- [ ] Database created and initialized
- [ ] Database user with appropriate permissions created
- [ ] Connection pooling configured
- [ ] Backup strategy implemented
- [ ] Database performance tuning applied

### Security
- [ ] All default passwords changed
- [ ] Environment variables secured (not in version control)
- [ ] JWT secret generated (min 32 characters)
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

### Application
- [ ] Backend built for production (`npm run build`)
- [ ] Frontend built for production (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Health check endpoints working

## Deployment

### Backend Deployment
- [ ] Code deployed to server
- [ ] Dependencies installed (`npm ci --production`)
- [ ] Environment variables set
- [ ] Process manager configured (PM2 or systemd)
- [ ] Service started and verified
- [ ] Health check passing
- [ ] Logs accessible

### Frontend Deployment
- [ ] Static files built
- [ ] Files deployed to web server
- [ ] Nginx/Apache configured
- [ ] SSL certificate installed
- [ ] HTTP to HTTPS redirect configured
- [ ] Gzip compression enabled
- [ ] Cache headers configured
- [ ] 404 handling configured

### Database Migration
- [ ] Backup created before migration
- [ ] Migration scripts tested on staging
- [ ] Migration executed successfully
- [ ] Data integrity verified
- [ ] Indexes created
- [ ] Hypertables configured

## Post-Deployment

### Verification
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Redis cache functioning
- [ ] Authentication working
- [ ] Asset management functional
- [ ] Risk scoring operational
- [ ] Anomaly detection working
- [ ] Forecasting functional
- [ ] Notifications sending
- [ ] Executive dashboard loading

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 200ms
- [ ] Database query performance acceptable
- [ ] Memory usage within limits
- [ ] CPU usage within limits
- [ ] No memory leaks detected

### Monitoring
- [ ] Health check monitoring configured
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring active
- [ ] Log aggregation working
- [ ] Alerts configured
- [ ] Uptime monitoring enabled
- [ ] SSL certificate expiry monitoring

### Documentation
- [ ] Deployment documentation updated
- [ ] API documentation accessible
- [ ] User guide available
- [ ] Admin guide created
- [ ] Runbook for common issues
- [ ] Contact information updated

### Backup & Recovery
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined
- [ ] Backup monitoring enabled

## Week 1 Post-Launch

### Daily Checks
- [ ] Monitor error logs
- [ ] Check system health
- [ ] Review performance metrics
- [ ] Verify backups completed
- [ ] Check disk space

### User Feedback
- [ ] Collect user feedback
- [ ] Address critical issues
- [ ] Document common questions
- [ ] Update FAQ

## Month 1 Post-Launch

### Review
- [ ] Performance review completed
- [ ] Security audit performed
- [ ] Capacity planning reviewed
- [ ] Cost analysis completed
- [ ] User satisfaction surveyed

### Optimization
- [ ] Database queries optimized
- [ ] Caching strategy refined
- [ ] CDN configured (if needed)
- [ ] Load balancing implemented (if needed)
- [ ] Auto-scaling configured (if needed)

## Rollback Plan

### If Issues Occur
1. **Immediate Actions**
   - [ ] Stop new deployments
   - [ ] Assess impact and severity
   - [ ] Notify stakeholders

2. **Rollback Steps**
   - [ ] Revert to previous version
   - [ ] Restore database backup (if needed)
   - [ ] Clear caches
   - [ ] Verify system functionality
   - [ ] Monitor for stability

3. **Post-Rollback**
   - [ ] Document issue
   - [ ] Identify root cause
   - [ ] Create fix plan
   - [ ] Test fix in staging
   - [ ] Schedule re-deployment

## Emergency Contacts

```
Technical Lead: _________________
DevOps Engineer: _________________
Database Admin: _________________
Security Team: _________________
On-Call Support: _________________
```

## Sign-Off

```
Deployment Date: _________________
Deployed By: _________________
Verified By: _________________
Approved By: _________________
```

---

## Quick Reference

### Critical Commands
```bash
# Check service status
systemctl status opssightai-api

# View logs
journalctl -u opssightai-api -f

# Restart service
systemctl restart opssightai-api

# Database backup
pg_dump -U postgres -d opssightai > backup.sql

# Check disk space
df -h

# Check memory
free -h

# Check processes
pm2 list
```

### Emergency Procedures

**Service Down**
```bash
# Check logs
pm2 logs opssightai-api --lines 100

# Restart
pm2 restart opssightai-api

# If still failing, rollback
pm2 stop opssightai-api
# Deploy previous version
pm2 start opssightai-api
```

**Database Issues**
```bash
# Check connections
docker exec opssightai-timescaledb psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Kill long-running queries
docker exec opssightai-timescaledb psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';"
```

**High Memory Usage**
```bash
# Check memory
docker stats

# Restart services
docker-compose restart

# If persistent, scale down
docker-compose up -d --scale backend=1
```

---

**Last Updated**: February 8, 2026  
**Version**: 1.0.0
