import { Check } from 'lucide-react';

interface CheckmarkIconProps {
  show: boolean;
}

export const CheckmarkIcon = ({ show }: CheckmarkIconProps) => {
  if (!show) return null;

  return (
    <div 
      className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 bg-green-500 rounded-full text-white"
      style={{ pointerEvents: 'none' }}
    >
      <Check size={16} strokeWidth={3} />
    </div>
  );
};
