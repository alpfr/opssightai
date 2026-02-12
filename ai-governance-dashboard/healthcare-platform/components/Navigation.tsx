'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Records', href: '/records', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-deep-slate text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Activity className="w-8 h-8 text-healing-teal" />
                <span className="text-xl font-bold">HealthCare</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-healing-teal text-white'
                        : 'text-soft-sage hover:bg-deep-slate/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="text-sm text-soft-sage">
              Dr. John Smith
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-error hover:bg-error/90 text-white transition-colors"
              onClick={() => {
                // Handle logout
                console.log('Logout clicked');
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-soft-sage hover:text-white hover:bg-deep-slate/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-deep-slate/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    active
                      ? 'bg-healing-teal text-white'
                      : 'text-soft-sage hover:bg-deep-slate/50 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-deep-slate/20">
            <div className="px-4 mb-3">
              <div className="text-base font-medium text-white">Dr. John Smith</div>
              <div className="text-sm text-soft-sage">john.smith@healthcare.com</div>
            </div>
            <div className="px-2">
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-base font-medium bg-error hover:bg-error/90 text-white transition-colors"
                onClick={() => {
                  // Handle logout
                  console.log('Logout clicked');
                }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
