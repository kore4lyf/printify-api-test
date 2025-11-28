import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 animate-fadeIn pointer-events-none`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-slate-900 transform ${
              position === 'top' ? 'top-full -mt-1 rotate-45' :
              position === 'bottom' ? 'bottom-full -mb-1 rotate-45' :
              position === 'left' ? 'left-full -ml-1 rotate-45' :
              'right-full -mr-1 rotate-45'
            }`}
          />
        </div>
      )}
    </div>
  );
}
