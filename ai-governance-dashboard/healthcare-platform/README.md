# Vantedge Health - AI-Driven Healthcare Platform

**Returning Humanity to Healthcare**

A modern, HIPAA-compliant healthcare platform built to solve the Small Practice Squeeze. Vantedge Health uses Agentic AI to handle logistics so doctors can focus on patients, not paperwork.

## 🏥 Our Mission

Independent clinics are trapped between rising administrative costs and physician burnout. Vantedge Health exists to:
- Protect physician time with Clinical-First AI
- Ensure no patient falls through the cracks with Closed-Loop Care
- Maintain RADICAL Transparency with ethics-led, HIPAA-native AI

**Learn More**: Visit `/about` for our complete story including the "Marcus scenario" and our 3 Pillars.

## 🎨 Brand Palette

- **Deep Slate** (#2C3E50) - Primary navigation and text
- **Healing Teal** (#1ABC9C) - Primary actions and highlights
- **Soft Sage** (#95A5A6) - Secondary text and accents

## 🔒 HIPAA Compliance Features

### 15-Minute Inactivity Timeout
- Automatic session expiration after 15 minutes of inactivity
- Warning notification 2 minutes before expiration
- Monitors user activity (mouse, keyboard, touch, scroll)
- Automatic logout and session cleanup

### Security Features
- Session data cleared on timeout
- Secure routing to login page
- Activity tracking for compliance
- Custom event system for warnings

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
vantedge-health/
├── app/
│   ├── layout.tsx                    # Root layout with Vantedge branding
│   ├── page.tsx                      # Dashboard page
│   ├── home/
│   │   └── page.tsx                  # Landing page with hero and features
│   ├── practices/
│   │   └── page.tsx                  # For Practices page with ROI
│   ├── features/
│   │   └── page.tsx                  # Features showcase with mockups
│   ├── pricing/
│   │   └── page.tsx                  # Pricing tiers and ROI calculator
│   ├── contact/
│   │   └── page.tsx                  # Contact form and info
│   ├── about/
│   │   └── page.tsx                  # About Us page (origin story, 3 pillars)
│   ├── globals.css                   # Global styles with theme
│   └── examples/
│       └── physician-dashboard/      # Example page for dashboard
├── components/
│   ├── Navigation.tsx                # Responsive navigation with Vantedge logo
│   ├── SessionWarning.tsx            # Inactivity warning component
│   ├── LayoutWrapper.tsx             # Layout with timeout hook
│   └── physician-mobile-dashboard/   # Physician dashboard components
│       ├── PhysicianMobileDashboard.tsx
│       ├── TriagePriorityBadge.tsx
│       ├── ClinicalBriefCard.tsx
│       ├── HistoricalContextSection.tsx
│       ├── ActionButtonGroup.tsx
│       ├── types.ts
│       └── index.ts
├── data/
│   ├── sampleData.ts                 # Comprehensive sample healthcare data
│   └── README.md                     # Data documentation
├── hooks/
│   └── useInactivityTimeout.ts       # HIPAA timeout hook
├── tests/
│   ├── unit/                         # Unit tests
│   └── property/                     # Property-based tests
└── public/
```

## 🎯 Key Features

### Complete Marketing Website (6 Pages)
A full-featured marketing site showcasing Vantedge Health:

**Home/Landing Page** (`/home`) - Hero with custom SVG logo, 3 Pillars, features, stats, CTAs

**For Practices** (`/practices`) - Provider value prop, ROI benefits, testimonial, implementation process

**Features** (`/features`) - Detailed showcases with UI mockups, 13 features total, EHR integrations

**Pricing** (`/pricing`) - 3 tiers (Starter $499, Professional $899, Enterprise custom), ROI calculator, FAQ

**Contact** (`/contact`) - Lead gen form with validation, contact info, success handling

**About** (`/about`) - Origin story (Marcus scenario), 3 Pillars, 2026 Edge, provider CTA

### Sample Data
Comprehensive healthcare data for all dashboard tabs (see `data/README.md`):
- 5 patients with complete medical profiles
- 7 appointments (all types and statuses)
- 9 medical records (labs, imaging, prescriptions)
- 16 KPIs across 4 analytics categories
- 3 chart datasets for visualizations
- User settings and preferences

### About Page - Vantedge Health
A professionally crafted About page that tells the Vantedge Health story:
- **Origin Story**: The "Marcus scenario" - how fragmented care affects real patients
- **The 3 Pillars**: Clinical-First AI, Closed-Loop Care, RADICAL Transparency
- **The 2026 Edge**: Role-based triage, smart logistics, predictive capacity planning
- **Provider CTA**: Warm invitation for clinic owners to join the network
- **Brand Voice**: Grounded, empathetic, clinical efficiency language
- **Under 600 words**: Glanceable for busy medical professionals

**Route**: Visit `/about` to see the complete story

### Physician's Mobile Dashboard
A complete mobile-optimized dashboard for physicians with:
- **Triage Priority Badge**: Color-coded urgency indicators (Red/Amber/Teal)
- **Clinical Brief Card**: Chief complaint and pain scale (0-10) display
- **Historical Context**: Past medical recurrences in highlighted call-out
- **Action Buttons**: Touch-optimized buttons (48px minimum) for MRI orders and referrals
- **96 Passing Tests**: Comprehensive unit and property-based testing
- **WCAG 2.1 AA Compliant**: Full accessibility support

```typescript
import { PhysicianMobileDashboard } from '@/components/physician-mobile-dashboard';

<PhysicianMobileDashboard
  urgency="High"
  chiefComplaint="Severe chest pain radiating to left arm"
  painScale={8}
  historicalContext={['Previous MI in 2020', 'Hypertension since 2018']}
  onOrderMRI={() => console.log('Order MRI')}
  onGenerateReferral={() => console.log('Generate Referral')}
/>
```

**Live Example**: Visit `/examples/physician-dashboard` to see interactive demos

### Responsive Navigation
- Mobile-friendly hamburger menu
- Active route highlighting
- Icon-based navigation with Lucide React
- User profile display
- Logout functionality

### Inactivity Timeout Hook
```typescript
useInactivityTimeout(
  timeoutMinutes: number = 15,
  onTimeout?: () => void
)
```

**Features:**
- Configurable timeout duration (default: 15 minutes)
- Optional callback before logout
- Automatic timer reset on user activity
- Warning notification system
- Session cleanup

### Session Warning Component
- Appears 2 minutes before timeout
- Dismissible notification
- Clear countdown display
- Animated slide-in effect

## 🎨 Theme Configuration

The theme is configured in `app/globals.css` using Tailwind CSS v4's `@theme` directive:

```css
:root {
  --deep-slate: #2C3E50;
  --healing-teal: #1ABC9C;
  --soft-sage: #95A5A6;
}
```

### Using Theme Colors

```tsx
// In Tailwind classes
<div className="bg-healing-teal text-deep-slate">

// In CSS
background: var(--healing-teal);
```

## 🔧 Customization

### Changing Timeout Duration

Edit `components/LayoutWrapper.tsx`:

```typescript
useInactivityTimeout(20); // 20 minutes instead of 15
```

### Adding Navigation Items

Edit `components/Navigation.tsx`:

```typescript
const navigation = [
  { name: 'New Page', href: '/new-page', icon: IconName },
  // ... existing items
];
```

### Customizing Theme Colors

Edit `app/globals.css`:

```css
:root {
  --deep-slate: #YourColor;
  --healing-teal: #YourColor;
  --soft-sage: #YourColor;
}
```

## 📊 Dashboard Features

- Real-time statistics cards
- Recent activity feed
- Patient metrics
- Appointment tracking
- HIPAA compliance notice

## 🔐 Security Best Practices

1. **Session Management**
   - 15-minute timeout enforced
   - Automatic cleanup on expiration
   - Warning before logout

2. **Data Protection**
   - Session storage cleared on logout
   - Local storage cleaned up
   - Secure routing

3. **User Activity Tracking**
   - Mouse movements
   - Keyboard input
   - Touch events
   - Scroll actions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SESSION_TIMEOUT=15
```

## 🧪 Testing

The platform includes comprehensive testing with 96 passing tests:

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Run linter
npm run lint

# Type check
npm run type-check
```

### Test Coverage
- **Unit Tests**: 85 tests covering specific examples and edge cases
- **Property-Based Tests**: 11 tests with 100+ iterations each using fast-check
- **Components Tested**: All dashboard components, navigation, session management
- **Accessibility Tests**: WCAG 2.1 AA compliance verification

## 📦 Deployment

### Production Deployment to GKE (Recommended)

The platform is production-ready with complete GKE deployment configuration.

**Quick Start:**
```bash
# Test locally first
npm run docker:test

# Create GKE cluster (first time only)
npm run gke:create-cluster

# Deploy to production
npm run deploy:gke
```

**Complete Documentation:**
- 📘 [Deployment Guide](DEPLOYMENT.md) - Step-by-step deployment instructions
- ✅ [Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md) - Complete before deploying
- 🎉 [Production Ready Summary](PRODUCTION_READY.md) - Overview of all features

**What's Included:**
- Kubernetes manifests (namespace, deployment, service, ingress, HPA)
- Docker configuration with multi-stage build
- Automated deployment scripts
- GitHub Actions CI/CD pipeline
- SSL/TLS with Google-managed certificates
- Auto-scaling (3-10 replicas)
- Health checks and monitoring
- Security best practices

### Local Docker Testing
```bash
# Build and test Docker image locally
npm run docker:build
npm run docker:test

# Or manually
docker-compose up
```

### Alternative: Vercel
```bash
npm run build
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@healthcare-platform.com

## 🚀 Production Deployment

### Infrastructure
- **Platform**: Google Kubernetes Engine (GKE)
- **Replicas**: 3-10 (auto-scaling)
- **SSL/TLS**: Google-managed certificates
- **Monitoring**: GKE monitoring + health checks
- **CI/CD**: GitHub Actions pipeline

### Deployment Scripts
```bash
npm run docker:test          # Test Docker build locally
npm run gke:create-cluster   # Create GKE cluster
npm run deploy:gke           # Deploy to GKE
```

### Key Features
- ✅ Production-ready Dockerfile
- ✅ Kubernetes manifests (deployment, service, ingress, HPA)
- ✅ Automated deployment scripts
- ✅ SSL/TLS certificates
- ✅ Auto-scaling configuration
- ✅ Health checks (liveness & readiness)
- ✅ Security best practices
- ✅ CI/CD pipeline

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.**

## 🔄 Changelog

### v1.3.0 (Current)
- ✅ **NEW**: Production-ready GKE deployment configuration
  - Complete Kubernetes manifests
  - Automated deployment scripts
  - GitHub Actions CI/CD pipeline
  - SSL/TLS with managed certificates
  - Auto-scaling (3-10 replicas)
  - Comprehensive deployment documentation
- ✅ **NEW**: Complete marketing website with 6 pages
  - Home/Landing page with hero, 3 pillars, features, stats
  - For Practices page with ROI, benefits, testimonial
  - Features page with detailed showcases and UI mockups
  - Pricing page with 3 tiers, ROI calculator, FAQ
  - Contact page with lead gen form and contact info
  - About page with origin story and mission
- ✅ Custom SVG logo with hexagon and pulse/heartbeat
- ✅ Updated navigation with all marketing pages
- ✅ Comprehensive sample data for all dashboard tabs
- ✅ Full responsive design (mobile, tablet, desktop)
- ✅ Working contact form with validation
- ✅ SEO metadata on all pages

### v1.2.0
- ✅ About Us page for Vantedge Health
- ✅ Brand integration throughout application
- ✅ Updated metadata and package.json

### v1.1.0
- ✅ **NEW**: Physician's Mobile Dashboard component
  - Triage priority badge with color-coded urgency
  - Clinical brief card with pain scale visualization
  - Historical context section for medical history
  - Touch-optimized action buttons (48px minimum)
  - 96 comprehensive tests (unit + property-based)
  - Full WCAG 2.1 AA accessibility compliance
- ✅ Interactive example page at `/examples/physician-dashboard`
- ✅ Property-based testing with fast-check
- ✅ Comprehensive TypeScript interfaces and documentation

### v1.0.0 (Initial Release)
- ✅ Next.js 15 setup with TypeScript
- ✅ Tailwind CSS v4 with healthcare theme
- ✅ Responsive navigation bar
- ✅ HIPAA-compliant 15-minute timeout
- ✅ Session warning system
- ✅ Dashboard with statistics
- ✅ Lucide React icons integration

---

**Built with ❤️ for Healthcare Professionals**

**Vantedge Health** • Founded 2026 • HIPAA Compliant • Returning Humanity to Healthcare

*Solving the Small Practice Squeeze*
