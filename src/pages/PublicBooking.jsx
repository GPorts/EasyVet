import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, PawPrint, User, Phone, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const speciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'rabbit', label: 'Coelho' },
  { value: 'other', label: 'Outro' },
];

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  const t = `${String(hour).padStart(2, '0')}:${min}`;
  return { value: t, label: t };
});

export default function PublicBooking() {
  const { clinicSlug } = useParams();
  const [clinic, setClinic] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [loadingClinic, setLoadingClinic] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tutorName: '', tutorPhone: '', petName: '', petSpecies: 'dog',
    date: '', time: '', notes: '',
  });

  useEffect(() => {
    const loadClinic = async () => {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('slug', clinicSlug)
          .single();
          
        if (error || !data) {
          setNotFound(true);
        } else {
          setClinic(data);
          setClinicId(data.id);
        }
      } catch (err) {
        console.error('Error loading clinic:', err);
        setNotFound(true);
      } finally {
        setLoadingClinic(false);
      }
    };
    loadClinic();
  }, [clinicSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          "tutorName": form.tutorName,
          "tutorPhone": form.tutorPhone,
          "petName": form.petName,
          date: form.date,
          time: form.time,
          notes: form.notes + (form.notes ? '\n' : '') + `Espécie: ${form.petSpecies}`,
          type: 'consultation',
          status: 'pending',
          source: 'public',
        });
        
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingClinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-10 h-10 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="text-center animate-fade-in">
          <AlertCircle size={64} className="text-surface-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Clínica não encontrada</h1>
          <p className="text-surface-500">O link que você acessou não corresponde a nenhuma clínica cadastrada.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
        <div className="text-center animate-scale-in max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-3">Solicitação Enviada! 🐾</h1>
          <p className="text-surface-600 mb-2">
            Seu agendamento foi enviado para <strong>{clinic?.name}</strong>.
          </p>
          <p className="text-surface-500 text-sm">
            A clínica entrará em contato para confirmar o horário. Aguarde!
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ tutorName: '', tutorPhone: '', petName: '', petSpecies: 'dog', date: '', time: '', notes: '' }); }}
            className="mt-6 text-primary-600 font-semibold text-sm hover:underline"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">{clinic?.name}</h1>
          <p className="text-surface-500 mt-2">Solicite seu agendamento online</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-surface-200/60 p-6 sm:p-8 animate-slide-up">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Seu Nome" icon={User}
              value={form.tutorName} onChange={e => setForm(f => ({ ...f, tutorName: e.target.value }))}
              required placeholder="Nome completo"
            />

            <Input
              label="WhatsApp" icon={Phone}
              value={form.tutorPhone} onChange={e => setForm(f => ({ ...f, tutorPhone: e.target.value }))}
              required placeholder="(11) 99999-9999"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do Pet" icon={PawPrint}
                value={form.petName} onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                required placeholder="Ex: Rex"
              />
              <Select
                label="Espécie"
                value={form.petSpecies} onChange={e => setForm(f => ({ ...f, petSpecies: e.target.value }))}
                options={speciesOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data Desejada" type="date" icon={Calendar}
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required min={new Date().toISOString().split('T')[0]}
              />
              <Select
                label="Horário Preferido"
                value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                options={timeSlots} required
              />
            </div>

            <Input
              label="Observações" type="textarea" icon={FileText}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Descreva o motivo da consulta, sintomas, etc..."
            />

            <Button type="submit" fullWidth size="lg" loading={submitting} icon={Calendar}>
              Solicitar Agendamento
            </Button>

            <p className="text-xs text-center text-surface-400 mt-4">
              Ao enviar, você concorda em ser contactado pela clínica via WhatsApp.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-surface-400 mt-8">
          Powered by <span className="font-bold text-primary-500">EasyVet</span> 🐾
        </p>
      </div>
    </div>
  );
}
