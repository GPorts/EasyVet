import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, PawPrint, Dog, Cat, Bird, Rabbit } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { usePets } from '../hooks/usePets';
import { useTutors } from '../hooks/useTutors';
import { getSpeciesLabel } from '../utils/formatters';

const speciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'rabbit', label: 'Coelho' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'reptile', label: 'Réptil' },
  { value: 'other', label: 'Outro' },
];

const speciesIcons = { dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit };

export default function Pets() {
  const { loadPets, createPet, updatePet, deletePet, searchPets, loading } = usePets();
  const { tutors, loadTutors } = useTutors();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', age: '', weight: '', tutorId: '', photoUrl: '',
  });



  const filteredPets = searchPets(search);

  const resetForm = () => {
    setForm({ name: '', species: 'dog', breed: '', age: '', weight: '', tutorId: '', photoUrl: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tutorData = tutors.find(t => t.id === form.tutorId);
      const data = { ...form, tutorName: tutorData?.name || '' };
      if (editing) {
        await updatePet(editing.id, data);
      } else {
        await createPet(data);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving pet:', err);
    }
  };

  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || '', species: pet.species || 'dog', breed: pet.breed || '',
      age: pet.age || '', weight: pet.weight || '', tutorId: pet.tutorId || '', photoUrl: pet.photoUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePet(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting pet:', err);
    }
  };

  const getTutorName = (tutorId) => tutors.find(t => t.id === tutorId)?.name || '—';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text" placeholder="Buscar pets..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>
        <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Novo Pet</Button>
      </div>

      {filteredPets.length === 0 ? (
        <Card className="text-center py-12">
          <PawPrint size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Nenhum pet cadastrado</h3>
          <p className="text-surface-500 text-sm mb-4">Adicione seu primeiro paciente para começar.</p>
          <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Cadastrar Pet</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredPets.map((pet) => {
            const SpeciesIcon = speciesIcons[pet.species] || PawPrint;
            return (
              <Card key={pet.id} hover padding={false} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.name} className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        <SpeciesIcon size={24} className="text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/pets/${pet.id}`} className="text-base font-bold text-surface-900 hover:text-primary-600 transition-colors">
                        {pet.name}
                      </Link>
                      <p className="text-sm text-surface-500">{getSpeciesLabel(pet.species)} {pet.breed && `• ${pet.breed}`}</p>
                      <p className="text-xs text-surface-400 mt-1">Tutor: {getTutorName(pet.tutorId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    {pet.age && <Badge variant="default" size="xs">{pet.age}</Badge>}
                    {pet.weight && <Badge variant="default" size="xs">{pet.weight} kg</Badge>}
                    {(pet.vaccines?.length || 0) > 0 && <Badge variant="primary" size="xs">{pet.vaccines.length} vacina(s)</Badge>}
                  </div>
                </div>
                <div className="flex border-t border-surface-100">
                  <Link to={`/pets/${pet.id}`} className="flex-1 py-3 text-center text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors">
                    Prontuário
                  </Link>
                  <button onClick={() => openEdit(pet)} className="flex-1 py-3 text-center text-xs font-semibold text-surface-500 hover:bg-surface-50 transition-colors border-l border-surface-100">
                    Editar
                  </button>
                  <button onClick={() => setDeleteConfirm(pet.id)} className="flex-1 py-3 text-center text-xs font-semibold text-danger-500 hover:bg-danger-50 transition-colors border-l border-surface-100">
                    Excluir
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Editar Pet' : 'Novo Pet'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do Pet" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Rex" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Espécie" value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} options={speciesOptions} />
            <Input label="Raça" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="Ex: Labrador" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Idade" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="Ex: 3 anos" />
            <Input label="Peso (kg)" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="Ex: 12.5" />
          </div>
          <Select label="Tutor" value={form.tutorId} onChange={e => setForm(f => ({ ...f, tutorId: e.target.value }))} options={tutors.map(t => ({ value: t.id, label: t.name }))} required />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" loading={loading}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" size="sm">
        <p className="text-surface-600 text-sm mb-6">Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
