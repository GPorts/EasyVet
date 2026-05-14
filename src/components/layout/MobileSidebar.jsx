import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, PawPrint, Users, Package, 
  LogOut, X, Globe, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pets', icon: PawPrint, label: 'Pets' },
  { path: '/tutors', icon: Users, label: 'Tutores' },
  { path: '/inventory', icon: Package, label: 'Estoque' },
  { path: '/pdv', icon: ShoppingCart, label: 'PDV' },
];

export default function MobileSidebar({ isOpen, onClose }) {
  const { clinicData, signOut } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-72 gradient-sidebar text-white animate-slide-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <span className="text-lg">🐾</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
              EasyVet
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Clinic name */}
        {clinicData && (
          <div className="px-4 pb-4">
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 font-medium">Clínica</p>
              <p className="text-sm font-semibold text-white/90 truncate">{clinicData.name}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-500/20 text-primary-300' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3 space-y-1">
          {clinicData?.slug && (
            <a
              href={`/book/${clinicData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-primary-300 hover:bg-white/5 transition-all"
            >
              <Globe size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">Link Público</span>
            </a>
          )}
          <button
            onClick={() => { signOut(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-white/50 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
