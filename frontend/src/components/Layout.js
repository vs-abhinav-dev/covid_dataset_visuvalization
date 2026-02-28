'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cuboid, Network, Activity, Globe2, FileText } from 'lucide-react';

export default function Layout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'OLAP / Data Cube', path: '/olap', icon: Cuboid },
    { name: 'Clustering', path: '/clustering', icon: Network },
    { name: 'Outliers', path: '/outliers', icon: Activity },
    { name: 'ML Insights', path: '/ml-insights', icon: FileText },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>
          <Globe2 size={28} className="text-accent" />
          <span>COVIZ</span>
        </h2>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={pathname === item.path ? 'active' : ''}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="welcome-text">
            {/* <span>Hello, Analyst  !</span> */}
            <strong>System Online <span style={{ color: '#00e5ff' }}>●</span></strong>
          </div>
        </header>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
