import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  type = 'text', 
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={`
              w-full py-2.5 rounded-xl border border-surface-300 
              bg-white text-surface-900 text-sm
              placeholder:text-surface-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
              transition-all duration-200
              disabled:bg-surface-100 disabled:cursor-not-allowed
              pr-4 ${Icon ? 'pl-11' : 'pl-4'}
              ${error ? 'border-danger-400 focus:ring-danger-500/30 focus:border-danger-500' : ''}
              ${className}
            `}
            rows={3}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            className={`
              w-full py-2.5 rounded-xl border border-surface-300 
              bg-white text-surface-900 text-sm
              placeholder:text-surface-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
              transition-all duration-200
              disabled:bg-surface-100 disabled:cursor-not-allowed
              pr-4 ${Icon ? 'pl-11' : 'pl-4'}
              ${error ? 'border-danger-400 focus:ring-danger-500/30 focus:border-danger-500' : ''}
              ${className}
            `}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-danger-600 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
