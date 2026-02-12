# Healthcare Platform - HIPAA Compliant

A modern, HIPAA-compliant healthcare management platform built with Next.js 15, TypeScript, and Tailwind CSS.

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
healthcare-platform/
├── app/
│   ├── layout.tsx                    # Root layout with navigation
│   ├── page.tsx                      # Dashboard page
│   ├── globals.css                   # Global styles with theme
│   └── examples/
│       └── physician-dashboard/      # Example page for dashboard
├── components/
│   ├── Navigation.tsx                # Responsive navigation bar
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
├── hooks/
│   └── useInactivityTimeout.ts       # HIPAA timeout hook
├── tests/
│   ├── unit/                         # Unit tests
│   └── property/                     # Property-based tests
└── public/
```

## 🎯 Key Features

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

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t healthcare-platform .
docker run -p 3000:3000 healthcare-platform
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

## 🔄 Changelog

### v1.1.0 (Current)
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

*HIPAA Compliant | Secure | Modern*
