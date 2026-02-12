# Healthcare Platform - Setup Guide

## 🎯 What Was Built

A production-ready Next.js 15 healthcare platform with:

### ✅ Core Features
1. **Next.js 15** with TypeScript and App Router
2. **Tailwind CSS v4** with healthcare brand palette
3. **Lucide React** icons integration
4. **Responsive Navigation** with mobile menu
5. **HIPAA-Compliant Timeout** (15-minute inactivity)
6. **Session Warning System** (2-minute warning)
7. **Dashboard** with statistics and activity feed

### 🎨 Brand Palette
- **Deep Slate** (#2C3E50) - Navigation, primary text
- **Healing Teal** (#1ABC9C) - Primary actions, highlights
- **Soft Sage** (#95A5A6) - Secondary text, accents

## 📁 File Structure

```
healthcare-platform/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard page
│   └── globals.css             # Theme configuration
├── components/
│   ├── Navigation.tsx          # Responsive nav bar
│   ├── SessionWarning.tsx      # Timeout warning
│   └── LayoutWrapper.tsx       # Timeout hook wrapper
├── hooks/
│   └── useInactivityTimeout.ts # HIPAA timeout hook
└── README.md                   # Full documentation
```

## 🚀 Quick Start

```bash
cd healthcare-platform
npm install
npm run dev
```

Open http://localhost:3000

## 🔒 HIPAA Compliance

### Inactivity Timeout
- **Duration**: 15 minutes (configurable)
- **Warning**: 2 minutes before expiration
- **Actions Monitored**: 
  - Mouse movement
  - Keyboard input
  - Touch events
  - Scroll actions
  - Clicks

### How It Works
1. Timer starts when page loads
2. Resets on any user activity
3. Warning appears at 13 minutes
4. Logout occurs at 15 minutes
5. Session data cleared
6. Redirects to login page

## 🎨 Using Theme Colors

### In Tailwind Classes
```tsx
<div className="bg-healing-teal text-deep-slate">
<button className="bg-soft-sage hover:bg-deep-slate">
```

### In CSS
```css
background: var(--healing-teal);
color: var(--deep-slate);
```

### Available Colors
- `bg-deep-slate` / `text-deep-slate`
- `bg-healing-teal` / `text-healing-teal`
- `bg-soft-sage` / `text-soft-sage`
- `bg-primary` / `text-primary`
- `bg-secondary` / `text-secondary`
- `bg-success` / `text-success`
- `bg-warning` / `text-warning`
- `bg-error` / `text-error`
- `bg-info` / `text-info`

## 🧩 Components

### Navigation
```tsx
import { Navigation } from '@/components/Navigation';

// Already included in layout.tsx
```

**Features:**
- Responsive design
- Mobile hamburger menu
- Active route highlighting
- User profile display
- Logout button

### Session Warning
```tsx
import { SessionWarning } from '@/components/SessionWarning';

// Already included in layout.tsx
```

**Features:**
- Auto-appears 2 minutes before timeout
- Dismissible
- Countdown display
- Animated entrance

### Inactivity Timeout Hook
```tsx
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

// In a client component
useInactivityTimeout(15, () => {
  console.log('Session expired');
});
```

**Parameters:**
- `timeoutMinutes` (default: 15)
- `onTimeout` (optional callback)

## 📝 Customization

### Change Timeout Duration
Edit `components/LayoutWrapper.tsx`:
```typescript
useInactivityTimeout(20); // 20 minutes
```

### Add Navigation Items
Edit `components/Navigation.tsx`:
```typescript
const navigation = [
  { name: 'New Page', href: '/new-page', icon: IconName },
  // ...
];
```

### Modify Theme Colors
Edit `app/globals.css`:
```css
:root {
  --healing-teal: #YourColor;
}
```

## 🔧 Next Steps

### 1. Add Authentication
```bash
npm install next-auth
```

Create `app/api/auth/[...nextauth]/route.ts`

### 2. Add Database
```bash
npm install prisma @prisma/client
npx prisma init
```

### 3. Add API Routes
Create files in `app/api/`:
- `app/api/patients/route.ts`
- `app/api/appointments/route.ts`

### 4. Add More Pages
```bash
# Create new pages
mkdir -p app/patients
touch app/patients/page.tsx
```

### 5. Environment Variables
Create `.env.local`:
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 🧪 Testing

```bash
# Install testing libraries
npm install -D @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔐 Security Checklist

- [x] 15-minute inactivity timeout
- [x] Session warning system
- [x] Automatic session cleanup
- [ ] Add authentication (Next Auth)
- [ ] Add HTTPS in production
- [ ] Add CSRF protection
- [ ] Add rate limiting
- [ ] Add audit logging
- [ ] Add encryption at rest
- [ ] Add secure headers

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa)

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors
```bash
# Regenerate types
npm run build
```

### Tailwind Not Working
```bash
# Clear cache
rm -rf .next
npm run dev
```

## ✅ Verification

Test these features:
1. Navigate between pages
2. Open mobile menu
3. Wait 13 minutes for warning
4. Interact to reset timer
5. Check responsive design
6. Verify theme colors

---

**Status**: ✅ Ready for Development

**Next**: Add authentication, database, and API routes
