# Healthcare Platform - Quick Reference

## 🚀 Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🎨 Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Slate | `#2C3E50` | Navigation, primary text |
| Healing Teal | `#1ABC9C` | Primary actions, highlights |
| Soft Sage | `#95A5A6` | Secondary text, accents |

### Tailwind Classes
```tsx
bg-deep-slate    text-deep-slate
bg-healing-teal  text-healing-teal
bg-soft-sage     text-soft-sage
bg-primary       text-primary
bg-success       text-success
bg-warning       text-warning
bg-error         text-error
```

## 🔒 HIPAA Timeout

**Duration**: 15 minutes  
**Warning**: 13 minutes (2 min before)  
**Actions**: Mouse, keyboard, touch, scroll, click

### Usage
```typescript
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

// In client component
useInactivityTimeout(15, () => {
  console.log('Session expired');
});
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout |
| `app/page.tsx` | Dashboard |
| `app/globals.css` | Theme config |
| `components/Navigation.tsx` | Nav bar |
| `components/SessionWarning.tsx` | Timeout warning |
| `hooks/useInactivityTimeout.ts` | Timeout hook |

## 🧩 Components

### Navigation
```tsx
import { Navigation } from '@/components/Navigation';
<Navigation />
```

### Session Warning
```tsx
import { SessionWarning } from '@/components/SessionWarning';
<SessionWarning />
```

### Layout Wrapper
```tsx
import { LayoutWrapper } from '@/components/LayoutWrapper';
<LayoutWrapper>{children}</LayoutWrapper>
```

## 📊 Icons (Lucide React)

```tsx
import { 
  Home, Users, Calendar, FileText,
  Settings, LogOut, Activity, Menu,
  X, AlertTriangle, TrendingUp
} from 'lucide-react';

<Home className="w-5 h-5" />
```

[Browse all icons](https://lucide.dev)

## 🔧 Customization

### Change Timeout
```typescript
// components/LayoutWrapper.tsx
useInactivityTimeout(20); // 20 minutes
```

### Add Nav Item
```typescript
// components/Navigation.tsx
{ name: 'Labs', href: '/labs', icon: FlaskConical }
```

### Modify Color
```css
/* app/globals.css */
--healing-teal: #16A085;
```

## 📝 Page Template

```tsx
export default function PageName() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-deep-slate mb-4">
        Page Title
      </h1>
      {/* Content */}
    </div>
  );
}
```

## 🎯 Common Patterns

### Card Component
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {/* Content */}
</div>
```

### Button Styles
```tsx
// Primary
<button className="bg-healing-teal hover:bg-healing-teal/90 text-white px-4 py-2 rounded-md">

// Secondary
<button className="bg-deep-slate hover:bg-deep-slate/90 text-white px-4 py-2 rounded-md">

// Danger
<button className="bg-error hover:bg-error/90 text-white px-4 py-2 rounded-md">
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Items */}
</div>
```

## 🔐 Security

### Session Storage
```typescript
// Clear on logout
localStorage.removeItem('session');
sessionStorage.clear();
```

### Redirect on Timeout
```typescript
router.push('/login?reason=timeout');
```

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops |
| `xl` | 1280px | Large screens |

```tsx
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

## 🆘 Troubleshooting

### Port in Use
```bash
lsof -ti:3000 | xargs kill -9
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

### TypeScript Errors
```bash
npm run build
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [TypeScript](https://www.typescriptlang.org/docs)

## ✅ Checklist

- [ ] Run `npm install`
- [ ] Start dev server
- [ ] Test navigation
- [ ] Test mobile menu
- [ ] Wait for timeout warning
- [ ] Verify responsive design
- [ ] Check theme colors

---

**Quick Start**: `cd healthcare-platform && npm install && npm run dev`
