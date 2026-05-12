import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => void;
  correctOTP?: string;
}

export const OtpVerificationModal = ({ isOpen, onClose, onConfirm, correctOTP = "1234" }: OtpVerificationModalProps) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Reset OTP inputs
  const resetOTPInputs = () => {
    setOtp(["", "", "", ""]);
    setIsError(false);
    setIsSuccess(false);
    // Clear all input fields
    inputRefs.forEach(ref => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
    // Focus first input
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  };

  // Handle OTP verification error
  const handleVerificationError = () => {
    setIsError(true);
    setIsSuccess(false);
    
    // Shake animation and clear after shake completes
    setTimeout(() => {
      resetOTPInputs();
    }, 500);
  };

  // Handle successful verification
  const handleVerificationSuccess = () => {
    setIsSuccess(true);
    setIsError(false);
    
    // Close modal after showing success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  useEffect(() => {
    if (isOpen) {
      resetOTPInputs();
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setIsError(false); // Clear error on new input
    setIsSuccess(false); // Clear success on new input

    // Auto-focus next input
    if (value && index < 3 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleConfirm = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      // Call parent verification function
      onConfirm(otpValue);
      
      // Check if OTP matches the correct one
      if (otpValue === correctOTP) {
        handleVerificationSuccess();
      } else {
        handleVerificationError();
      }
    } else {
      // Don't submit if OTP is incomplete
      console.log("Please enter all 4 digits");
    }
  };

  const handleCancel = () => {
    resetOTPInputs();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" data-modal-content>
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          {isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Delivery Verified!</h2>
              <p className="text-gray-600">
                The delivery has been successfully verified and completed.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black mb-2">Verify Delivery</h2>
              <p className="text-gray-600">
                Please enter the 4-digit OTP sent to the customer to complete the delivery.
              </p>
            </>
          )}
        </div>

        {/* OTP Input - Hide on success */}
        {!isSuccess && (
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                  isError 
                    ? 'border-red-500 text-red-500 shake-animation' 
                    : isSuccess
                    ? 'border-green-500 text-green-500'
                    : 'border-gray-300 focus:border-[#f58634]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="text-center text-red-600 text-sm mb-4">
            Invalid OTP. Please try again.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isSuccess ? (
            <>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 border-2 border-gray-300 rounded-lg hover:border-[#f58634] hover:text-[#f58634] transition-all duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={otp.join("").length !== 4}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#f58634] rounded-lg hover:bg-[#e07428] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Verify Delivery
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Dummy OTP Display - Hide on success */}
        {!isSuccess && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Demo OTP: <span className="font-mono font-semibold">{correctOTP}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
