
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { FiSun, FiMoon, FiMenu } from 'react-icons/fi';

interface TopAppBarProps {
  onMenuClick?: () => void;
}

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const { user } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface-dim/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-md">
        <button className="lg:hidden text-on-surface p-2" onClick={onMenuClick}>
          <FiMenu className="w-6 h-6" />
        </button>
        <span className="material-symbols-outlined text-primary text-headline-md hidden lg:block">shield_lock</span>
        <h1 className="text-body-lg font-headline-lg tracking-tight text-on-surface">SecureDoc AI</h1>
      </div>
      <div className="flex items-center gap-md">
        <div className="hidden md:flex items-center gap-xs px-md py-xs bg-surface-container-high rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 ai-pulse-dot"></span>
          <span className="text-label-mono font-label-mono text-on-surface-variant">SYSTEM SECURE</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors border border-white/5"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <FiSun className="text-on-surface-variant" /> : <FiMoon className="text-on-surface-variant" />}
        </button>

        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBhsCVhl_RUkP8Wd1q39N354wDImDOAYZmwMVCiOEAloE_dhIxzlB_e0wVPQlTN0aWwhaxKlAnHeBQMdJIi3_4U0eVJkxuOUG068OXQ7cu-shrh-J5aRCsiRz2ro0HZacKZ0lam4eA4zxUaDteLbidFWrMsOTn0JUM2rFNDqHTBdqD_Mu-oziDCrjKuewYcxlmM7B9X3YTUmrQcBSLvKCa2WzIcwZJ36TfNxYmljsPzBEv33Is2EzLkGGYDnrfBU98qzxCKpMBylTQ"}
          />
        </div>
      </div>
    </header>
  );
}
