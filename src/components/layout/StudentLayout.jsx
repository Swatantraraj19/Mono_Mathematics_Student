import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { SkeletonLoader } from '../common/SkeletonLoader';

/**
 * Master Student Layout Shell.
 */
export const StudentLayout = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden antialiased">
      {/* Mobile Slide Navigation Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Desktop Fixed 100vh Sidebar */}
      <div className="hidden lg:flex lg:shrink-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Header onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Independent Scrolling Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl w-full mx-auto pb-12">
            <Suspense fallback={<SkeletonLoader variant="dashboard" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
