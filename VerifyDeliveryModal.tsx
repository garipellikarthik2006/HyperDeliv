import { useState } from "react";
import { X, Shield, CheckCircle } from "lucide-react";

interface VerifyDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobId: string;
  jobType: 'food' | 'print';
}

export const VerifyDeliveryModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  jobId, 
  jobType 
}: VerifyDeliveryModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-in" data-modal-content>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Shield className="text-orange-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Delivery</h2>
          <p className="text-gray-600">
            Job #{jobId} ({jobType === 'food' ? 'Food Order' : 'Print Job'}) is now ready for delivery.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            An OTP has been generated and sent to the customer for delivery verification.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-4">
          {!isConfirmed ? (
            <button
              onClick={handleConfirm}
              className="w-full px-6 py-3 text-base font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              Confirm Ready for Delivery
            </button>
          ) : (
            <div className="w-full px-6 py-3 text-base font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Delivery Initiated Successfully!
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold">Next Steps:</span> The customer will receive an OTP 
            to verify delivery completion. You can track the delivery status in your job board.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideInRight 0.3s ease-out;
        }

        .scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VerifyDeliveryModal;
