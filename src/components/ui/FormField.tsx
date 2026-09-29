import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {helpText && !error && <p className="text-xs text-neutral-400">{helpText}</p>}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
