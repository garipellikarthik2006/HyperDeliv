import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield, Key, CheckCircle, AlertCircle } from "lucide-react";

const OtpVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const [otpData, setOtpData] = useState<any>(null);

  const jobId = searchParams.get('jobId');
  const type = searchParams.get('type');
  const urlOTP = searchParams.get('otp');

  useEffect(() => {
    // Get OTP data from localStorage
    const storedOTPData = localStorage.getItem('currentDeliveryOTP');
    if (storedOTPData) {
      const data = JSON.parse(storedOTPData);
      setOtpData(data);
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    
    setError(false);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    const correctOTP = otpData?.otp || urlOTP;
    
    if (otpValue === correctOTP) {
      setIsVerified(true);
      setError(false);
      
      // Notify parent window about successful verification
      if (window.opener) {
        window.opener.postMessage({
          type: 'OTP_VERIFIED',
          otp: otpValue,
          jobId: jobId,
          jobType: type
        }, '*');
      }
      
      // Close window after successful verification
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      setError(true);
      // Shake animation
      const form = document.getElementById("otp-form");
      if (form) {
        form.classList.add("animate-shake");
        setTimeout(() => form.classList.remove("animate-shake"), 500);
      }
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Verified!</h2>
          <p className="text-gray-600 mb-4">
            The delivery has been successfully verified and completed.
          </p>
          <div className="text-sm text-gray-500">
            This window will close automatically...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Shield className="text-orange-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery OTP Verification</h1>
          <p className="text-gray-600">
            Enter the 4-digit OTP to verify the delivery completion
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Job ID: <span className="font-mono font-semibold">{jobId}</span> | 
            Type: <span className="font-semibold capitalize">{type}</span>
          </div>
        </div>

        <form id="otp-form" className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Enter OTP
            </label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-14 w-14 rounded-lg border-2 text-center text-xl font-bold focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    error ? "border-red-500 bg-red-50 text-red-500" : "border-gray-300 bg-gray-50"
                  }`}
                />
              ))}
            </div>
            {error && (
              <div className="mt-3 flex items-center justify-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">Invalid OTP. Please try again.</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              For demo purposes, use OTP:
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
              <Key size={16} />
              <span className="font-mono font-bold">{otpData?.otp || urlOTP || '1234'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={otp.join("").length !== 4}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Verify Delivery
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            This is a secure OTP verification window
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
