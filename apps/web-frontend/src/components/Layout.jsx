import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = true }) => {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-slate-900">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <main className="flex-1 ml-72">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
