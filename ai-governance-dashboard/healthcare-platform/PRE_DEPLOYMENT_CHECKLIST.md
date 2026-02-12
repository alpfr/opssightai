# Vantedge Health - Pre-Deployment Checklist

Complete this checklist before deploying to production.

## ✅ Environment Configuration

### Required Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` - Set to production URL (https://vantedgehealth.com)
- [ ] `NEXT_PUBLIC_ENVIRONMENT` - Set to "production"
- [ ] `SENDGRID_API_KEY` - Valid SendGrid API key
- [ ] `SENDGRID_FROM_EMAIL` - Verified sender email
- [ ] `API_SECRET_KEY` - Generated secure random key (32+ characters)
- [ ] `SESSION_SECRET` - Generated secure random key (32+ characters)
- [ ] `CSRF_SECRET` - Generated secure random key (32+ characters)

### Optional but Recommended
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics tracking ID
- [ ] `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
- [ ] `SENTRY_AUTH_TOKEN` - Sentry authentication token
- [ ] `HUBSPOT_API_KEY` - HubSpot CRM integration (if using)

### Generate Secure Keys
```bash
# Generate random keys for secrets
openssl rand -base64 32  # API_SECRET_KEY
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 32  # CSRF_SECRET
```

## 🔐 Security Configuration

### Kubernetes Secrets
- [ ] Updated `k8s/secret.yaml` with actual values (not placeholders)
- [ ] Verified all secret keys are present
- [ ] Secrets are base64 encoded if using kubectl directly
- [ ] Removed `k8s/secret.yaml` from version control (add to .gitignore)

### SSL/TLS Certificates
- [ ] Domain ownership verified
- [ ] DNS records ready to update
- [ ] Managed certificate configured in `k8s/managed-certificate.yaml`
- [ ] Domains match your actual domain names

### Security Headers
- [ ] Reviewed security headers in `next.config.ts`
- [ ] HSTS configured correctly
- [ ] CSP policy appropriate for your needs
- [ ] Permissions-Policy configured

## 🌐 Domain & DNS

### Domain Setup
- [ ] Domain registered and active
- [ ] Access to DNS management console
- [ ] DNS propagation time considered (24-48 hours)

### DNS Records to Create
- [ ] A record: `vantedgehealth.com` → Ingress IP
- [ ] A record: `www.vantedgehealth.com` → Ingress IP
- [ ] (Optional) CNAME: `www` → `vantedgehealth.com`

### Email Configuration
- [ ] SPF record configured for SendGrid
- [ ] DKIM records configured
- [ ] DMARC policy set
- [ ] Sender email verified in SendGrid

## 🏗️ Infrastructure

### GCP Project Setup
- [ ] GCP project created
- [ ] Billing enabled
- [ ] APIs enabled:
  - [ ] Kubernetes Engine API
  - [ ] Container Registry API
  - [ ] Compute Engine API
  - [ ] Cloud Load Balancing API
- [ ] Service account created with appropriate permissions
- [ ] Service account key downloaded (for CI/CD)

### GKE Cluster
- [ ] Cluster created or ready to create
- [ ] Region selected (consider latency to users)
- [ ] Node pool configuration reviewed
- [ ] Auto-scaling configured (min: 3, max: 10)
- [ ] Workload Identity enabled
- [ ] Monitoring and logging enabled

### Container Registry
- [ ] GCR access configured
- [ ] Docker authentication set up
- [ ] Image naming convention decided

## 📦 Application Build

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Linter passing (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No console errors in development
- [ ] All features tested manually

### Docker Build
- [ ] Dockerfile reviewed and optimized
- [ ] `.dockerignore` configured
- [ ] Local Docker build successful
- [ ] Local Docker container runs correctly
- [ ] Health check endpoint working

### Dependencies
- [ ] All dependencies up to date
- [ ] No critical security vulnerabilities
- [ ] Production dependencies only in final image
- [ ] Package-lock.json committed

## 🧪 Testing

### Local Testing
- [ ] Development server runs without errors
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Navigation works on all pages
- [ ] Mobile responsive design verified
- [ ] Accessibility tested (WCAG 2.1 AA)

### Docker Testing
- [ ] `npm run docker:test` successful
- [ ] Container health check passing
- [ ] All environment variables loaded
- [ ] API endpoints responding
- [ ] Static assets serving correctly

### Integration Testing
- [ ] Contact form sends emails
- [ ] Analytics tracking working (if configured)
- [ ] Error monitoring capturing errors (if configured)
- [ ] Session timeout working (15 minutes)

## 📊 Monitoring & Logging

### Application Monitoring
- [ ] Health check endpoint implemented (`/api/health`)
- [ ] Error tracking configured (Sentry or similar)
- [ ] Performance monitoring set up
- [ ] Custom metrics defined (if needed)

### Infrastructure Monitoring
- [ ] GKE monitoring enabled
- [ ] Log aggregation configured
- [ ] Alerting rules defined
- [ ] Dashboard created for key metrics

### Alerts to Configure
- [ ] Pod crash alerts
- [ ] High CPU/memory usage
- [ ] Failed health checks
- [ ] Certificate expiration warnings
- [ ] High error rates

## 🚀 Deployment Preparation

### Scripts & Automation
- [ ] Deployment scripts tested
- [ ] Scripts have execute permissions
- [ ] CI/CD pipeline configured (if using)
- [ ] Rollback procedure documented

### Documentation
- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] Architecture diagram created
- [ ] Runbook for common issues

### Team Preparation
- [ ] Team trained on deployment process
- [ ] Access credentials distributed securely
- [ ] On-call rotation established
- [ ] Incident response plan documented

## 💼 Business Readiness

### Legal & Compliance
- [ ] Privacy policy updated
- [ ] Terms of service reviewed
- [ ] HIPAA compliance verified
- [ ] Data processing agreements signed
- [ ] Cookie consent implemented (if needed)

### Marketing
- [ ] Launch announcement prepared
- [ ] Social media posts scheduled
- [ ] Email campaign ready
- [ ] Press release drafted (if applicable)

### Support
- [ ] Support email configured
- [ ] Help documentation published
- [ ] FAQ page updated
- [ ] Support team trained

## 🔄 Backup & Recovery

### Backup Strategy
- [ ] Database backup configured (if applicable)
- [ ] Configuration backup plan
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined

### Rollback Plan
- [ ] Previous version tagged in Git
- [ ] Rollback procedure tested
- [ ] Database migration rollback plan (if applicable)
- [ ] DNS rollback procedure documented

## 📈 Performance

### Optimization
- [ ] Images optimized
- [ ] Code splitting configured
- [ ] Caching strategy implemented
- [ ] CDN configured (if needed)

### Load Testing
- [ ] Load tests performed
- [ ] Performance benchmarks established
- [ ] Scaling thresholds defined
- [ ] Resource limits appropriate

## 🎯 Launch Day

### Pre-Launch (T-24 hours)
- [ ] Final code freeze
- [ ] All tests passing
- [ ] Staging environment verified
- [ ] Team briefed on launch plan

### Launch (T-0)
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Update DNS records
- [ ] Monitor for issues

### Post-Launch (T+1 hour)
- [ ] Smoke tests completed
- [ ] All pages accessible
- [ ] Forms working
- [ ] Analytics tracking
- [ ] No critical errors

### Post-Launch (T+24 hours)
- [ ] Monitor metrics
- [ ] Review logs for errors
- [ ] Check performance
- [ ] Gather user feedback

## 📝 Sign-Off

### Technical Lead
- [ ] Code review completed
- [ ] Security review passed
- [ ] Performance acceptable
- [ ] Documentation complete

**Name**: ________________  
**Date**: ________________  
**Signature**: ________________

### Product Owner
- [ ] Features complete
- [ ] User acceptance testing passed
- [ ] Business requirements met
- [ ] Ready for launch

**Name**: ________________  
**Date**: ________________  
**Signature**: ________________

### DevOps Lead
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Runbook complete

**Name**: ________________  
**Date**: ________________  
**Signature**: ________________

---

## 🆘 Emergency Contacts

**Technical Issues**:
- DevOps Lead: [contact]
- Backend Lead: [contact]
- Frontend Lead: [contact]

**Business Issues**:
- Product Owner: [contact]
- Project Manager: [contact]

**Infrastructure**:
- GCP Support: [support link]
- SendGrid Support: [support link]

---

**Last Updated**: February 2026  
**Version**: 1.3.0  
**Next Review**: Before each deployment
