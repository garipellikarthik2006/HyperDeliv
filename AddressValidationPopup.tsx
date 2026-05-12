import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AddressValidationPopupProps {
  show: boolean;
  message?: string;
  onHide?: () => void;
}

export const AddressValidationPopup = ({ 
  show, 
  message = "Please enter a valid address from the suggestions.",
  onHide 
}: AddressValidationPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onHide?.();
        }, 300); // Wait for slide-out animation
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-3
        bg-white border border-red-200 rounded-lg shadow-lg
        p-4 min-w-[300px] max-w-[400px]
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-sm text-gray-800 font-medium">
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => {
            onHide?.();
          }, 300);
        }}
        className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};
