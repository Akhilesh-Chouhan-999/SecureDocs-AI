import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopAppBar } from "../components/shared/TopAppBar";
import { SideNavigation } from "../components/shared/SideNavigation";

export default function MainLayout({ children }: { children?: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopAppBar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 pt-16">
        <SideNavigation 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 w-full lg:pl-[280px] p-margin-mobile md:p-margin-desktop overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
