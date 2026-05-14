import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Syringe, FileText, Upload, PawPrint, Calendar, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { usePets } from '../hooks/usePets';
import { useTutors } from '../hooks/useTutors';
import { useStorage } from '../hooks/useStorage';
import WhatsAppButton from '../components/shared/WhatsAppButton';
import { generateVaccineReminderLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getSpeciesLabel } from '../utils/formatters';

export default function PetDetail() {
  const { id } = useParams();
  const { getPetById, addVaccine, addMedicalRecord, loading } = usePets();
  const { tutors, loadTutors } = useTutors();
  const { uploadMedicalFile, uploading } = useStorage();
  const { clinicData } = useAuth();
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('records');
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({ name: '', appliedAt: '', boosterAt: '', lot: '', vet: '' });
  const [recordForm, setRecordForm] = useState({ date: '', description: '', files: [] });

  const loadPet = async () => {
    const data = await getPetById(id);
    setPet(data);
    if (data?.tutorId) {
      await loadTutors();
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { loadPet(); loadTutors(); }, [id]);
  
  const tutor = pet?.tutorId && tutors.length ? tutors.find(t => t.id === pet.tutorId) : null;

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    try {
      await addVaccine(id, vaccineForm);
      setShowVaccineModal(false);
      setVaccineForm({ name: '', appliedAt: '', boosterAt: '', lot: '', vet: '' });
      await loadPet();
    } catch (err) { console.error(err); }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      let fileUrls = [];
      for (const file of recordForm.files) {
        const url = await uploadMedicalFile(id, file);
        fileUrls.push({ name: file.name, url });
      }
      await addMedicalRecord(id, { date: recordForm.date, description: recordForm.description, files: fileUrls });
      setShowRecordModal(false);
      setRecordForm({ date: '', description: '', files: [] });
      await loadPet();
    } catch (err) { console.error(err); }
  };

  if (!pet) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" /></div>;
  }

  const vaccines = pet.vaccines || [];
  const records = pet.medicalRecords || [];
  const tabs = [
    { id: 'records', label: 'Prontuário', icon: FileText, count: records.length },
    { id: 'vaccines', label: 'Vacinas', icon: Syringe, count: vaccines.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} /> Voltar para Pets
      </Link>

      {/* Pet Header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <PawPrint size={40} className="text-primary-500" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-surface-900">{pet.name}</h2>
            <p className="text-surface-500 mt-1">{getSpeciesLabel(pet.species)} {pet.breed && `• ${pet.breed}`}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {pet.age && <Badge variant="default">{pet.age}</Badge>}
              {pet.weight && <Badge variant="default">{pet.weight} kg</Badge>}
              <Badge variant="primary">{vaccines.length} vacina(s)</Badge>
              <Badge variant="accent">{records.length} registro(s)</Badge>
            </div>
          </div>
          {tutor && (
            <div className="text-right shrink-0">
              <p className="text-sm text-surface-500">Tutor</p>
              <p className="font-semibold text-surface-900">{tutor.name}</p>
              {tutor.phone && (
                <p className="text-sm text-surface-500">{tutor.phone}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            <tab.icon size={16} /> {tab.label}
            {tab.count > 0 && <span className="text-xs bg-surface-200 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button icon={Plus} size="sm" onClick={() => setShowRecordModal(true)}>Novo Registro</Button>
          </div>
          {records.length === 0 ? (
            <Card className="text-center py-8">
              <FileText size={40} className="text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">Nenhum registro no prontuário.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...records].reverse().map((rec, i) => (
                <Card key={rec.id || i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-surface-400" />
                        <span className="text-xs text-surface-500 font-medium">{formatDate(rec.date || rec.createdAt)}</span>
                      </div>
                      <p className="text-sm text-surface-800">{rec.description}</p>
                    </div>
                  </div>
                  {rec.files?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rec.files.map((f, j) => (
                        <a key={j} href={f.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-50 text-accent-700 text-xs font-medium hover:bg-accent-100 transition-colors">
                          <Upload size={12} /> {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button icon={Plus} size="sm" onClick={() => setShowVaccineModal(true)}>Nova Vacina</Button>
          </div>
          {vaccines.length === 0 ? (
            <Card className="text-center py-8">
              <Syringe size={40} className="text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">Nenhuma vacina registrada.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...vaccines].reverse().map((vac, i) => (
                <Card key={vac.id || i}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-surface-900">{vac.name}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-surface-500">
                        <span>Aplicação: <strong className="text-surface-700">{formatDate(vac.appliedAt)}</strong></span>
                        {vac.boosterAt && <span>Reforço: <strong className="text-surface-700">{formatDate(vac.boosterAt)}</strong></span>}
                        {vac.lot && <span>Lote: {vac.lot}</span>}
                        {vac.vet && <span>Vet: {vac.vet}</span>}
                      </div>
                    </div>
                    {tutor?.phone && vac.boosterAt && clinicData && (
                      <WhatsAppButton
                        href={generateVaccineReminderLink(tutor.phone, pet.name, vac.name, formatDate(vac.boosterAt), clinicData.name)}
                        label="Lembrar" size="sm"
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vaccine Modal */}
      <Modal isOpen={showVaccineModal} onClose={() => setShowVaccineModal(false)} title="Registrar Vacina">
        <form onSubmit={handleAddVaccine} className="space-y-4">
          <Input label="Nome da Vacina" value={vaccineForm.name} onChange={e => setVaccineForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: V10" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Aplicação" type="date" value={vaccineForm.appliedAt} onChange={e => setVaccineForm(f => ({ ...f, appliedAt: e.target.value }))} required />
            <Input label="Data do Reforço" type="date" value={vaccineForm.boosterAt} onChange={e => setVaccineForm(f => ({ ...f, boosterAt: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lote" value={vaccineForm.lot} onChange={e => setVaccineForm(f => ({ ...f, lot: e.target.value }))} placeholder="Opcional" />
            <Input label="Veterinário" value={vaccineForm.vet} onChange={e => setVaccineForm(f => ({ ...f, vet: e.target.value }))} placeholder="Opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => setShowVaccineModal(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Registrar</Button>
          </div>
        </form>
      </Modal>

      {/* Record Modal */}
      <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title="Novo Registro Médico">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <Input label="Data" type="date" value={recordForm.date} onChange={e => setRecordForm(f => ({ ...f, date: e.target.value }))} required />
          <Input label="Descrição" type="textarea" value={recordForm.description} onChange={e => setRecordForm(f => ({ ...f, description: e.target.value }))} required placeholder="Descreva o atendimento, diagnóstico, tratamento..." />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Arquivos / Fotos</label>
            <input type="file" multiple onChange={e => setRecordForm(f => ({ ...f, files: Array.from(e.target.files) }))}
              className="w-full text-sm text-surface-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => setShowRecordModal(false)}>Cancelar</Button>
            <Button type="submit" loading={loading || uploading}>{uploading ? 'Enviando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
