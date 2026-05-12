import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DollarSign, CreditCard, Smartphone, BanknoteIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OrderData {
  type: 'food' | 'print';
  pickupLocation?: string;
  dropLocation?: string;
  recipientPhone?: string;
  fileName?: string;
  copies?: number;
  printType?: 'bw' | 'color';
  estimatedTime?: string;
  orderId?: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const orderData = location.state?.orderData as OrderData;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'online' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderData) {
      toast({
        title: "No Order Found",
        description: "Please complete your order first.",
        variant: "destructive",
      });
      navigate("/food");
      return;
    }
  }, [orderData, navigate, toast]);

  const getOrderSummary = () => {
    if (orderData.type === 'food') {
      return {
        title: "Food Delivery Request",
        description: `${orderData.pickupLocation} → ${orderData.dropLocation}`,
        amount: 50
      };
    } else {
      return {
        title: "Print Job",
        description: `${orderData.fileName} - ${orderData.copies} copies (${orderData.printType === 'color' ? 'Color' : 'B&W'})`,
        amount: (orderData.copies || 1) * (orderData.printType === 'color' ? 10 : 5)
      };
    }
  };

  const summary = getOrderSummary();

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate order ID if not exists
      const orderId = orderData.orderId || `DF${Date.now()}`;
      
      toast({
        title: "Payment Confirmed!",
        description: `Your order has been placed successfully with ${selectedPaymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}.`,
      });

      // Navigate to tracking with payment information
      navigate("/tracking", {
        state: {
          orderData: {
            ...orderData,
            orderId,
            paymentMethod: selectedPaymentMethod,
            amount: summary.amount,
            estimatedTime: orderData.estimatedTime || "25-30 minutes"
          }
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => orderData?.type === 'food' ? navigate("/food") : navigate("/print")}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to {orderData?.type === 'food' ? 'Food Delivery' : 'Print Upload'}
          </button>
          <h1 className="text-3xl font-bold text-foreground">Payment</h1>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Order Summary Card */}
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Order Summary</h2>
            
            <div className="mb-4 rounded-lg bg-muted p-4">
              r<h3 className="mb-2 text-lg font-medium text-foreground">{summary.title}</h3>
              <p className="text-muted-foreground">{summary.description}</p>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-lg font-medium text-foreground">Total Amount</span>
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-primary" />
                <span className="text-2xl font-bold text-primary">₹{summary.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Select Payment Method</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Cash Option */}
              <button
                onClick={() => setSelectedPaymentMethod('cash')}
                className={`rounded-lg border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md ${
                  selectedPaymentMethod === 'cash'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <BanknoteIcon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pay via Cash</h3>
                    <p className="text-sm text-muted-foreground">Cash on Delivery/Pickup</p>
                  </div>
                </div>
              </button>

              {/* Online Payment Option */}
              <button
                onClick={() => setSelectedPaymentMethod('online')}
                className={`rounded-lg border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md ${
                  selectedPaymentMethod === 'online'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <CreditCard size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Online Payment</h3>
                    <p className="text-sm text-muted-foreground">UPI, Cards & NetBanking</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Smartphone size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Razorpay</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Payment Method Note */}
            {selectedPaymentMethod === 'online' && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You will be redirected to a secure Razorpay gateway.
                </p>
              </div>
            )}

            {selectedPaymentMethod === 'cash' && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Payment will be collected upon delivery/pickup.
                </p>
              </div>
            )}
          </div>

          {/* Confirm Payment Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={!selectedPaymentMethod || isProcessing}
            className="w-full rounded-md py-4 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: '#f58634' }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </span>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
