
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const { logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: "dashboard" },
    { name: "Risk Assessment", href: ROUTES.REPORTS, icon: "analytics" },
    { name: "Document Analysis", href: ROUTES.DOCUMENTS, icon: "document_scanner" },
    { name: "Secure Vault", href: ROUTES.VAULT, icon: "lock" },
    { name: "Settings", href: ROUTES.SETTINGS, icon: "settings" },
  ];

  return (
    <>
      <aside className={`
        fixed left-0 top-16 w-[280px] h-[calc(100vh-64px)] 
        bg-surface-container-lowest border-r border-white/10 p-md z-40
        flex flex-col transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="text-label-mono font-label-mono text-on-surface-variant mb-md px-md uppercase tracking-widest mt-4">
          Main Menu
        </div>
        
        <nav className="flex-1 space-y-sm">
          {navigation.map((item) => {
            // Precise active matching for Dashboard to prevent it from matching everything
            const isActive = item.href === ROUTES.DASHBOARD 
              ? location.pathname === ROUTES.DASHBOARD 
              : location.pathname.startsWith(item.href);
              
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors ${
                  isActive 
                    ? "bg-surface-container text-primary" 
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-body-md font-body-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-md">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-md px-md py-sm w-full text-left text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md font-body-md">Sign Out</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          style={{ top: '64px' }}
        />
      )}
    </>
  );
}
