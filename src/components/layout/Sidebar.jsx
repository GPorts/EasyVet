import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, PawPrint, Users, Package, 
  Settings, LogOut, ChevronLeft, ChevronRight, Globe, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pets', icon: PawPrint, label: 'Pets' },
  { path: '/tutors', icon: Users, label: 'Tutores' },
  { path: '/inventory', icon: Package, label: 'Estoque' },
  { path: '/pdv', icon: ShoppingCart, label: 'PDV (Caixa)' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { clinicData, signOut } = useAuth();
  const location = useLocation();

  return (
    <aside 
      className={`
        hidden lg:flex flex-col
        gradient-sidebar text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-24' : 'w-72'}
        min-h-screen sticky top-0 shadow-2xl
      `}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 h-16`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shadow-inner">
              <span className="text-xl">🐾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
                EasyVet
              </h1>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shadow-inner">
            <span className="text-xl">🐾</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Clinic Name */}
      {!collapsed && clinicData && (
        <div className="px-5 pb-4">
          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 shadow-sm backdrop-blur-sm">
            <p className="text-xs text-white/50 font-medium mb-0.5">Clínica</p>
            <p className="text-base font-semibold text-white/90 truncate">{clinicData.name}</p>
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
              className={`
                flex items-center gap-4 px-4 py-3.5 rounded-xl
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-500/20 text-primary-300 shadow-lg shadow-primary-500/10 border border-primary-500/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2 : 1.5} 
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
              />
              {!collapsed && (
                <span className="text-base font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary-400 shadow-sm shadow-primary-400/50" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Public Link */}
      {!collapsed && clinicData?.slug && (
        <div className="px-3 pb-2">
          <a
            href={`/book/${clinicData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/40 hover:text-primary-300 hover:bg-white/10 transition-all duration-200"
          >
            <Globe size={20} strokeWidth={1.5} />
            <span className="text-sm font-medium">Link Público</span>
          </a>
        </div>
      )}

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <NavLink
          to="/settings"
          className={`
            flex items-center gap-4 px-4 py-3.5 rounded-xl
            text-white/50 hover:text-white hover:bg-white/10
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings size={20} strokeWidth={1.5} />
          {!collapsed && <span className="text-base font-medium">Configurações</span>}
        </NavLink>
        <button
          onClick={signOut}
          className={`
            flex items-center gap-4 px-4 py-3.5 rounded-xl w-full
            text-white/50 hover:text-danger-400 hover:bg-danger-500/10
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} strokeWidth={1.5} />
          {!collapsed && <span className="text-base font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
