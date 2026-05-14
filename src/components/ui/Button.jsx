import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30',
  secondary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-md shadow-accent-500/20 hover:shadow-lg hover:shadow-accent-500/30',
  danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-md shadow-danger-500/20',
  ghost: 'bg-transparent hover:bg-surface-100 text-surface-700',
  outline: 'border-2 border-surface-300 hover:border-primary-500 hover:bg-primary-50 text-surface-700 hover:text-primary-700',
  success: 'bg-success-600 hover:bg-primary-700 text-white shadow-md shadow-success-500/20',
  whatsapp: 'bg-[#25D366] hover:bg-[#1da851] text-white shadow-md shadow-[#25D366]/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconRight: IconRight,
  loading = false, 
  disabled = false, 
  fullWidth = false,
  className = '', 
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} strokeWidth={2} />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} strokeWidth={2} />
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
