import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';

interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  custom?: (value: string) => boolean | string;
}

interface FormInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationRule;
  optional?: boolean;
  error?: string;
  type?: string;
}

export function FormInputWithValidation({
  id,
  label,
  placeholder,
  value,
  onChange,
  validation,
  optional = false,
  error: externalError,
  type = 'text',
}: FormInputProps) {
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string>('');

  const validateField = useCallback((val: string) => {
    if (!validation) return '';

    if (validation.required && !val.trim()) {
      return 'This field is required';
    }

    if (!val && !validation.required) return '';

    if (validation.minLength && val.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters`;
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters`;
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return 'Invalid format';
    }

    if (validation.custom) {
      const result = validation.custom(val);
      if (result !== true) {
        return typeof result === 'string' ? result : 'Invalid input';
      }
    }

    return '';
  }, [validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (touched) {
      setInternalError(validateField(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setInternalError(validateField(value));
  };

  const displayError = externalError || internalError;
  const isValid = touched && !displayError && value.trim() !== '';

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 flex items-center gap-2"
      >
        {label}
        {optional && <span className="text-slate-500">(Optional)</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500 pr-10 transition-colors ${
            displayError && touched
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
              : isValid
              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30'
              : ''
          }`}
        />
        {displayError && touched && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
        {isValid && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
        )}
      </div>
      {displayError && touched && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </p>
      )}
    </div>
  );
}
