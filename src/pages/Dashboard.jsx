import { Link } from 'react-router-dom';
import { Calendar, PawPrint, Package, Syringe, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAppointments } from '../hooks/useAppointments';
import { usePets } from '../hooks/usePets';
import { useInventory } from '../hooks/useInventory';
import { getStatusConfig } from '../utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { todayAppointments } = useAppointments();
  const { pets, getPendingVaccines } = usePets();
  const { getLowStockProducts, getExpiringProducts, loading } = useInventory();

  const lowStock = getLowStockProducts();
  const expiring = getExpiringProducts(30);
  const pendingVaccines = getPendingVaccines();
  const today = new Date();

  const stats = [
    { title: 'Consultas Hoje', value: todayAppointments.length, icon: Calendar, iconBg: 'bg-primary-500' },
    { title: 'Pets Cadastrados', value: pets.length, icon: PawPrint, iconBg: 'bg-accent-500' },
    { title: 'Estoque Baixo', value: lowStock.length, icon: Package, iconBg: lowStock.length > 0 ? 'bg-danger-500' : 'bg-success-500' },
    { title: 'Vacinas Pendentes', value: pendingVaccines.length, icon: Syringe, iconBg: pendingVaccines.length > 0 ? 'bg-warning-500' : 'bg-success-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="gradient-hero rounded-2xl p-6 lg:p-10 border border-primary-200/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-surface-900">Bom dia! 🐾</h2>
            <p className="text-surface-600 mt-1">
              {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Link to="/agenda">
            <Button variant="primary" icon={Calendar} iconRight={ArrowRight}>Ver Agenda</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {stats.map((stat, i) => (
          <Card key={i} hover className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">{stat.title}</p>
                <p className="text-3xl font-bold text-surface-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-lg`}>
                <stat.icon size={22} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.iconBg} opacity-5`} />
          </Card>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card title="Consultas de Hoje" icon={Clock} className="flex flex-col h-full min-h-[500px]"
          action={<Link to="/agenda"><Button variant="ghost" size="sm" iconRight={ArrowRight}>Ver todas</Button></Link>}>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={40} className="text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">Nenhuma consulta hoje.</p>
              <Link to="/agenda" className="text-primary-600 text-sm font-medium hover:underline mt-1 inline-block">Agendar</Link>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {todayAppointments.map((apt, i) => {
                const sc = getStatusConfig(apt.status);
                const badgeVariant = apt.status === 'confirmed' ? 'primary' : apt.status === 'completed' ? 'accent' : apt.status === 'cancelled' ? 'danger' : 'warning';
                return (
                  <div key={apt.id || i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors border border-surface-100">
                    <div className={`w-1.5 h-14 rounded-full ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-surface-900 truncate">{apt.petName || 'Pet'}</p>
                      <p className="text-xs text-surface-500 truncate">{apt.tutorName || 'Tutor'} • {apt.type || 'Consulta'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-surface-700">{apt.time}</p>
                      <Badge variant={badgeVariant} size="xs">{sc.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Alerts */}
        <div className="space-y-8">
          <Card title="Alertas de Estoque" icon={AlertTriangle} className="flex flex-col flex-1"
            action={<Link to="/inventory"><Button variant="ghost" size="sm" iconRight={ArrowRight}>Ver estoque</Button></Link>}>
            {lowStock.length === 0 && expiring.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={36} className="text-success-500 mx-auto mb-2" />
                <p className="text-surface-500 text-sm">Estoque normal.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[250px]">
                {lowStock.slice(0, 4).map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-danger-50 border border-danger-100">
                    <Package size={16} className="text-danger-500 shrink-0" />
                    <span className="text-sm text-danger-700 font-medium truncate flex-1">{p.name}</span>
                    <Badge variant="danger" size="xs">{p.currentQty} un.</Badge>
                  </div>
                ))}
                {expiring.slice(0, 3).map((p, i) => (
                  <div key={`e-${p.id||i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-warning-50 border border-warning-100">
                    <AlertTriangle size={16} className="text-warning-500 shrink-0" />
                    <span className="text-sm text-warning-700 font-medium truncate flex-1">{p.name}</span>
                    <Badge variant="warning" size="xs">Vence breve</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Vacinas Pendentes" subtitle="Próximos 7 dias" icon={Syringe} className="flex flex-col flex-1">
            {pendingVaccines.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={36} className="text-success-500 mx-auto mb-2" />
                <p className="text-surface-500 text-sm">Sem reforços pendentes.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[250px]">
                {pendingVaccines.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-warning-50 border border-warning-100">
                    <Syringe size={16} className="text-warning-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 truncate">{item.pet.name}</p>
                      <p className="text-xs text-surface-500 truncate">{item.vaccine.name}</p>
                    </div>
                    <Badge variant={item.daysUntil === 0 ? 'danger' : 'warning'} size="xs">
                      {item.daysUntil === 0 ? 'Hoje' : `${item.daysUntil}d`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
