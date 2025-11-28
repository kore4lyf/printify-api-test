import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className={`flex items-center ${index < steps.length - 1 && "flex-1"}`}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <label className="text-xs font-medium text-slate-600 mt-2 text-center whitespace-nowrap px-1">
                  {step.label}
                </label>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
