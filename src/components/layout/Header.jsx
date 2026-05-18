import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ title, subtitle, onMenuClick }) {
  const { user, clinicData } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-surface-200/60">
      <div className="flex items-center justify-between px-6 lg:px-10 h-[72px]">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-surface-100 text-surface-500 lg:hidden transition-colors"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900">{title || 'Dashboard'}</h1>
            {subtitle && (
              <p className="text-sm text-surface-500">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Avatar */}
        <div className="flex items-center gap-3">

          {/* User Avatar */}
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-surface-200">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
              {clinicData?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-surface-800 leading-tight">
                  {clinicData?.name || 'Clínica'}
                </p>
                {clinicData?.plan_status === 'active' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                    Premium
                  </span>
                )}
                {clinicData?.plan_status === 'trial' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                    Trial
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-400 leading-tight">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
