import { useState, useEffect } from "react";
import { Key, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface OtpDisplayProps {
  onClose: () => void;
}

const OtpDisplay = ({ onClose }: OtpDisplayProps) => {
  const [otpData, setOtpData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    // Check for OTP data in localStorage
    const checkOTP = () => {
      const storedOTPData = localStorage.getItem('currentDeliveryOTP');
      if (storedOTPData) {
        const data = JSON.parse(storedOTPData);
        setOtpData(data);
      }
    };

    // Initial check
    checkOTP();

    // Set up interval to check for new OTPs
    const interval = setInterval(checkOTP, 1000);

    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!otpData) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Key className="text-green-600" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Delivery OTP Generated</h3>
              <p className="text-xs text-gray-600">Share this OTP with the delivery person</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Your OTP:</span>
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Clock size={12} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="bg-orange-500 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-center gap-2">
              <Key size={20} className="text-white" />
              <span className="text-white font-bold text-xl tracking-wider">{otpData.otp}</span>
            </div>
            <div className="text-center text-white text-sm mt-2">
              Share this OTP with the rider: <span className="font-bold">{otpData.otp}</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Job ID: <span className="font-mono">{otpData.jobId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle size={12} />
          <span>Ready for delivery verification</span>
        </div>

        {timeLeft === 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={12} />
            <span>OTP expired</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpDisplay;
