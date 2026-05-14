import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, PawPrint, Package, ShoppingCart } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pets', icon: PawPrint, label: 'Pets' },
  { path: '/inventory', icon: Package, label: 'Estoque' },
  { path: '/pdv', icon: ShoppingCart, label: 'PDV' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-white/90 backdrop-blur-xl border-t border-surface-200 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'text-primary-600' 
                    : 'text-surface-400 hover:text-surface-600'
                  }
                `}
              >
                <div className={`
                  p-1 rounded-lg transition-all duration-200
                  ${isActive ? 'bg-primary-100' : ''}
                `}>
                  <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
