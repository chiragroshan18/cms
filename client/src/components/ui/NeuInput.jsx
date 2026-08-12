import React from 'react';

export function NeuInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  rows,
  className = '',
  ...props
}) {
  const inputClasses = `w-full bg-neu-bg text-neu-text placeholder-neu-muted neu-inset rounded-neu px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-neu-primary/50 ${
    Icon ? 'pl-10' : ''
  } ${error ? 'ring-2 ring-neu-danger' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-neu-muted uppercase tracking-wider">
          {label} {required && <span className="text-neu-danger">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 w-4 h-4 text-neu-muted pointer-events-none" />}
        {type === 'textarea' ? (
          <textarea
            rows={rows || 4}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        )}
      </div>
      {error && <p className="text-xs text-neu-danger font-medium mt-1">{error}</p>}
    </div>
  );
}
