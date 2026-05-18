import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import MobileSidebar from './MobileSidebar';
import Paywall from '../shared/Paywall';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral da sua clínica' },
  '/agenda': { title: 'Agenda', subtitle: 'Gerencie seus agendamentos' },
  '/pets': { title: 'Pets', subtitle: 'Gerencie seus pacientes' },
  '/tutors': { title: 'Tutores', subtitle: 'Gerencie os tutores' },
  '/inventory': { title: 'Estoque', subtitle: 'Controle de produtos' },
  '/settings': { title: 'Configurações', subtitle: 'Configurações da clínica' },
};

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = pageTitles[location.pathname] || { title: 'EasyVet', subtitle: '' };

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Desktop Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Header 
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 h-full">
          <Paywall featureName="o sistema">
            <Outlet />
          </Paywall>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
