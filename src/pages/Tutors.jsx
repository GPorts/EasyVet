import { useState } from 'react';
import { Plus, Search, Users, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useTutors } from '../hooks/useTutors';
import { usePets } from '../hooks/usePets';
import { formatPhone, formatCPF } from '../utils/formatters';
import WhatsAppButton from '../components/shared/WhatsAppButton';
import { generateWhatsAppLink } from '../utils/whatsapp';

export default function Tutors() {
  const { loadTutors, createTutor, updateTutor, deleteTutor, searchTutors, loading } = useTutors();
  const { pets, loadPets } = usePets();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', address: '' });



  const filteredTutors = searchTutors(search);
  const getPetsForTutor = (tutorId) => pets.filter(p => p.tutorId === tutorId);

  const resetForm = () => {
    setForm({ name: '', cpf: '', phone: '', email: '', address: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateTutor(editing.id, form); }
      else { await createTutor(form); }
      setShowModal(false);
      resetForm();
    } catch (err) { 
      console.error(err);
      alert('Erro ao salvar tutor: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const openEdit = (tutor) => {
    setEditing(tutor);
    setForm({ name: tutor.name || '', cpf: tutor.cpf || '', phone: tutor.phone || '', email: tutor.email || '', address: tutor.address || '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Buscar tutores..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
        </div>
        <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Novo Tutor</Button>
      </div>

      {filteredTutors.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Nenhum tutor cadastrado</h3>
          <p className="text-surface-500 text-sm mb-4">Adicione tutores para vincular aos pets.</p>
          <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Cadastrar Tutor</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-4 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Nome</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">CPF</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Pets</th>
                <th className="text-right py-4 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredTutors.map((tutor) => {
                const tutorPets = getPetsForTutor(tutor.id);
                return (
                  <tr key={tutor.id} className="hover:bg-surface-50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center font-bold text-accent-700 text-sm shrink-0">
                          {tutor.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-surface-900">{tutor.name}</p>
                          <p className="text-xs text-surface-400 md:hidden">{formatPhone(tutor.phone)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {tutor.phone && <p className="text-sm text-surface-600 flex items-center gap-1.5"><Phone size={12} /> {formatPhone(tutor.phone)}</p>}
                        {tutor.email && <p className="text-sm text-surface-500 flex items-center gap-1.5"><Mail size={12} /> {tutor.email}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden lg:table-cell">
                      <span className="text-sm text-surface-600">{formatCPF(tutor.cpf)}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1.5">
                        {tutorPets.length === 0 ? (
                          <span className="text-xs text-surface-400">—</span>
                        ) : tutorPets.map(pet => (
                          <span key={pet.id} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                            🐾 {pet.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {tutor.phone && (
                          <WhatsAppButton href={generateWhatsAppLink(tutor.phone, `Olá ${tutor.name}! 🐾`)} label="" size="sm" />
                        )}
                        <button onClick={() => openEdit(tutor)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-accent-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(tutor.id)} className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Editar Tutor' : 'Novo Tutor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="João da Silva" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            <Input label="Telefone (WhatsApp)" icon={Phone} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" required />
          </div>
          <Input label="E-mail" type="email" icon={Mail} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@email.com" />
          <Input label="Endereço" icon={MapPin} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro" />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" loading={loading}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" size="sm">
        <p className="text-surface-600 text-sm mb-6">Tem certeza que deseja excluir este tutor?</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={async () => { await deleteTutor(deleteConfirm); setDeleteConfirm(null); }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
