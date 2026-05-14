export default function Card({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  action,
  glass = false, 
  padding = true,
  hover = false,
  className = '',
  ...props 
}) {
  return (
    <div
      className={`
        rounded-2xl border
        ${glass 
          ? 'glass' 
          : 'bg-white border-surface-200/60'
        }
        ${hover ? 'hover:shadow-lg hover:border-surface-300/60 hover:-translate-y-0.5 cursor-pointer' : 'shadow-sm'}
        transition-all duration-300 ease-out
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Icon size={20} className="text-primary-600" strokeWidth={1.5} />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-surface-900">{title}</h3>}
              {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
