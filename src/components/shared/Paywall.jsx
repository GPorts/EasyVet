import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Rocket, CreditCard } from 'lucide-react';

const Paywall = ({ children, featureName = "esta funcionalidade" }) => {
  const { clinicData, user } = useAuth();

  // Permite acesso se o plano for premium
  const hasAccess = clinicData?.plan === 'premium';

  if (hasAccess) {
    return children;
  }

  const caktoLink = `https://pay.cakto.com.br/bj7adfq_887639?email=${encodeURIComponent(user?.email || '')}`;

  return (
    <div className="relative">
      {/* Conteúdo borrado ao fundo para dar um efeito premium */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay do Paywall */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl border border-dashed border-gray-300">
        <div className="max-w-md w-full p-8 bg-white shadow-2xl rounded-2xl border border-gray-100 text-center transform transition-all animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Recurso Premium</h3>
          <p className="text-gray-600 mb-8">
            Ops! Parece que você precisa de um plano ativo para acessar {featureName}. 
            Assine agora e libere todo o potencial da sua clínica.
          </p>

          <div className="space-y-4">
            <a
              href={caktoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
            >
              <Rocket className="w-5 h-5" />
              Assinar Plano Premium
            </a>
            
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all"
            >
              <CreditCard className="w-5 h-5 text-gray-400" />
              Já paguei? Clique para atualizar
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Pagamento seguro processado pela Cakto. Liberação instantânea após aprovação.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
