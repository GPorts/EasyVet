-- Adicionando campos de assinatura na tabela de clínicas
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS plan_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS next_billing timestamp with time zone;

-- Comentários para documentação
COMMENT ON COLUMN public.clinics.plan_status IS 'Status da assinatura: trial, active, inactive, past_due';
COMMENT ON COLUMN public.clinics.plan_type IS 'Tipo do plano: free, premium, enterprise';
