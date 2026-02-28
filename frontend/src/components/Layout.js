'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'OLAP Analysis', path: '/olap' },
    { name: 'Clustering', path: '/clustering' },
    { name: 'Outliers', path: '/outliers' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>COVID-19 Viz</h2>
        <nav>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={pathname === item.path ? 'active' : ''}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
