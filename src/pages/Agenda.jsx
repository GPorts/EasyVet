import { useState, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MoreVertical, Edit2, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAppointments } from '../hooks/useAppointments';
import { usePets } from '../hooks/usePets';
import { useTutors } from '../hooks/useTutors';
import { getStatusConfig } from '../utils/formatters';
import WhatsAppButton from '../components/shared/WhatsAppButton';
import { generateConfirmationLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameMonth, isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const appointmentTypes = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'vaccine', label: 'Vacinação' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'exam', label: 'Exame' },
  { value: 'grooming', label: 'Banho/Tosa' },
  { value: 'return', label: 'Retorno' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'other', label: 'Outro' },
];

const timeSlots = Array.from({ length: 22 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? '00' : '30';
  const t = `${String(hour).padStart(2,'0')}:${min}`;
  return { value: t, label: t };
});

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { loadAppointments, appointments, createAppointment, updateAppointment, updateStatus, deleteAppointment, loading } = useAppointments();
  const { pets, loadPets } = usePets();
  const { tutors, loadTutors } = useTutors();
  const { clinicData } = useAuth();

  const [form, setForm] = useState({
    petId: '', petName: '', tutorId: '', tutorName: '', tutorPhone: '',
    date: '', time: '', type: 'consultation', notes: '',
  });



  const calendarDays = useCallback(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getAppointmentsForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return appointments.filter(a => a.date === ds);
  };

  const selectedDayAppointments = getAppointmentsForDay(selectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const handlePetChange = (petId) => {
    const pet = pets.find(p => p.id === petId);
    const tutor = pet ? tutors.find(t => t.id === pet.tutorId) : null;
    setForm(f => ({
      ...f, petId, petName: pet?.name || '',
      tutorId: tutor?.id || '', tutorName: tutor?.name || '', tutorPhone: tutor?.phone || '',
    }));
  };

  const resetForm = () => {
    setForm({ petId: '', petName: '', tutorId: '', tutorName: '', tutorPhone: '', date: '', time: '', type: 'consultation', notes: '' });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, form);
      } else {
        await createAppointment({ ...form, status: 'pending', source: 'internal' });
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving appointment:', err);
    }
  };

  const openNewAppointment = (date) => {
    resetForm();
    setForm(f => ({ ...f, date: format(date || selectedDate, 'yyyy-MM-dd') }));
    setShowModal(true);
  };

  const openEditAppointment = (apt) => {
    setEditingAppointment(apt);
    setForm({
      petId: apt.petId || '', petName: apt.petName || '', tutorId: apt.tutorId || '',
      tutorName: apt.tutorName || '', tutorPhone: apt.tutorPhone || '',
      date: apt.date || '', time: apt.time || '', type: apt.type || 'consultation', notes: apt.notes || '',
    });
    setShowModal(true);
    setContextMenu(null);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div />
        <Button icon={Plus} onClick={() => openNewAppointment()}>Novo Agendamento</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-4 border-b border-surface-100 flex items-center justify-between">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
              <ChevronLeft size={20} className="text-surface-600" />
            </button>
            <h3 className="text-lg font-bold text-surface-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
              <ChevronRight size={20} className="text-surface-600" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-surface-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays().map((day, i) => {
                const dayApts = getAppointmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 min-h-[60px] sm:min-h-[80px] rounded-xl text-left
                      transition-all duration-200 group
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${isSelected ? 'bg-primary-50 border-2 border-primary-500 shadow-md' : 'hover:bg-surface-100 border-2 border-transparent'}
                      ${isTodayDate && !isSelected ? 'bg-accent-50 border-accent-200' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-semibold
                      ${isSelected ? 'text-primary-700' : isTodayDate ? 'text-accent-700' : 'text-surface-700'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayApts.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {dayApts.slice(0, 3).map((apt, j) => {
                          const sc = getStatusConfig(apt.status);
                          return <div key={j} className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />;
                        })}
                        {dayApts.length > 3 && (
                          <span className="text-[9px] text-surface-400 font-medium">+{dayApts.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Day Detail */}
        <Card padding={false}>
          <div className="p-4 border-b border-surface-100">
            <h3 className="font-bold text-surface-900">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-surface-500">{selectedDayAppointments.length} agendamento(s)</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="text-surface-300 mx-auto mb-2" />
                <p className="text-surface-400 text-sm">Nenhum agendamento</p>
                <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={() => openNewAppointment(selectedDate)}>
                  Adicionar
                </Button>
              </div>
            ) : (
              selectedDayAppointments.map((apt) => {
                const sc = getStatusConfig(apt.status);
                return (
                  <div key={apt.id} className="relative p-3 rounded-xl border border-surface-200 hover:border-surface-300 bg-white transition-all group">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 self-stretch rounded-full ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-surface-900">{apt.petName || 'Pet'}</p>
                          <div className="relative">
                            <button onClick={() => setContextMenu(contextMenu === apt.id ? null : apt.id)} className="p-1 rounded-lg hover:bg-surface-100 opacity-0 group-hover:opacity-100 transition-all">
                              <MoreVertical size={14} className="text-surface-400" />
                            </button>
                            {contextMenu === apt.id && (
                              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-surface-200 py-1 z-10 min-w-[160px] animate-scale-in">
                                <button onClick={() => openEditAppointment(apt)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-surface-700">
                                  <Edit2 size={14} /> Editar
                                </button>
                                {apt.status !== 'confirmed' && (
                                  <button onClick={() => { updateStatus(apt.id, 'confirmed'); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-primary-600">
                                    <CheckCircle size={14} /> Confirmar
                                  </button>
                                )}
                                {apt.status !== 'completed' && (
                                  <button onClick={() => { updateStatus(apt.id, 'completed'); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-accent-600">
                                    <CheckCircle size={14} /> Concluir
                                  </button>
                                )}
                                {apt.status !== 'cancelled' && (
                                  <button onClick={() => { updateStatus(apt.id, 'cancelled'); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 text-danger-600">
                                    <XCircle size={14} /> Cancelar
                                  </button>
                                )}
                                <hr className="my-1 border-surface-100" />
                                <button onClick={() => { deleteAppointment(apt.id); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-danger-50 text-danger-600">
                                  <Trash2 size={14} /> Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-surface-500">{apt.tutorName || 'Tutor'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={apt.status === 'confirmed' ? 'primary' : apt.status === 'completed' ? 'accent' : apt.status === 'cancelled' ? 'danger' : 'warning'} size="xs" dot>
                            {sc.label}
                          </Badge>
                          <span className="text-xs text-surface-500 font-medium">{apt.time}</span>
                        </div>
                        {apt.tutorPhone && clinicData && (
                          <div className="mt-2">
                            <WhatsAppButton
                              href={generateConfirmationLink(apt.tutorPhone, apt.petName, format(new Date(apt.date + 'T12:00:00'), 'dd/MM/yyyy'), apt.time, clinicData.name)}
                              label="Confirmar" size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* New/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Pet" value={form.petId} onChange={(e) => handlePetChange(e.target.value)} options={pets.map(p => ({ value: p.id, label: p.name }))} required />
          <Input label="Tutor" value={form.tutorName} disabled placeholder="Selecionado automaticamente" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Select label="Horário" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} options={timeSlots} required />
          </div>
          <Select label="Tipo" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={appointmentTypes} />
          <Input label="Observações" type="textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações..." />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" loading={loading}>{editingAppointment ? 'Salvar' : 'Agendar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
