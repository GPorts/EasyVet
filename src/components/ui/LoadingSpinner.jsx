export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        ${sizes[size] || sizes.md}
        rounded-full
        border-[3px] border-surface-200
        border-t-primary-600
        animate-spin
      `} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-[3px] border-primary-100 border-t-primary-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🐾</span>
        </div>
      </div>
      <p className="text-surface-500 text-sm font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
