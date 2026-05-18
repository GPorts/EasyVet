import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (clinicName.trim().length < 3) {
      setError('O nome da clínica deve ter pelo menos 3 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, clinicName.trim());
      
      // REDIRECIONAMENTO PARA A CAKTO:
      // Substitua SEU_LINK_AQUI pelo link de checkout do seu produto na Cakto.
      // O parâmetro ?email= ou &email= garante que a Cakto vai enviar esse email no webhook.
      const caktoLink = `https://pay.cakto.com.br/SEU_LINK_AQUI?email=${encodeURIComponent(email)}`;
      window.location.href = caktoLink;
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-3xl">🐾</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">EasyVet</h1>
              <p className="text-primary-200 text-sm">Sistema Veterinário Inteligente</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Comece agora,<br />
            é gratuito!
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Cadastre sua clínica em segundos e comece a gerenciar seus pacientes, 
            agenda e estoque de forma inteligente.
          </p>
          <div className="mt-12 space-y-4">
            {[
              '✅ Dashboard completo com alertas',
              '✅ Agenda inteligente com calendário',
              '✅ Prontuários digitais com upload',
              '✅ Controle de estoque e validade',
              '✅ Notificações via WhatsApp',
            ].map((feature, i) => (
              <p key={i} className="text-white/80 text-sm">{feature}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              EasyVet
            </h1>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-surface-900">Crie sua conta</h2>
            <p className="text-surface-500 mt-2">Cadastre sua clínica para começar.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome da Clínica"
              icon={Building2}
              placeholder="Clínica Veterinária XYZ"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            />

            <Input
              label="E-mail"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              icon={Lock}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={loading}
              iconRight={ArrowRight}
            >
              Criar Conta
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-50 text-surface-500">Ou</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline"
            fullWidth 
            size="lg" 
            loading={googleLoading}
            onClick={async () => {
              try {
                setGoogleLoading(true);
                await signInWithGoogle();
              } catch (err) {
                setError('Erro ao criar conta com o Google.');
                setGoogleLoading(false);
              }
            }}
            className="bg-white"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Cadastrar com o Google
          </Button>

          <p className="text-center text-sm text-surface-500 mt-8">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
