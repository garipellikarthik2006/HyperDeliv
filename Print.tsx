import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import { OrderSync, assignVendorToOrder } from "@/lib/orderSync";
import { useAuth } from "@/context/AuthContext";
import { useHyperdelivData } from "@/lib/hyperdelivData";
import PageWrapper from "@/components/PageWrapper";

const printIllustration = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

const Print = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOrder } = useHyperdelivData();
  const [printType, setPrintType] = useState<"bw" | "color">("bw");
  const [copies, setCopies] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState(20); // ₹20 for delivery
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();




  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.length) {
      toast({
        title: "No File Selected",
        description: "Please select a file to print.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress) {
      toast({
        title: "Missing Delivery Address",
        description: "Please enter a delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Missing Payment Method",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Get file details
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    // Create print order using OrderSync (writes to dabbaflow_orders - shared with Vendor & Admin)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const itemPrice = copies * (printType === 'color' ? 5 : 3);

    const newOrder = OrderSync.addOrder({
      type: 'Print',
      details: {
        fileName: file.name,
        documentType: printType,
        pageCount: Math.ceil(copies),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        deliveryLocation: deliveryAddress,
        dropLocation: deliveryAddress,
        urgency: 'normal',
        paymentMethod: paymentMethod
      },
      status: 'Pending',
      customer: user?.email || 'Student User',
      price: itemPrice + deliveryCharges,
      itemPrice,
      deliveryFee: deliveryCharges,
      serviceCharge: 0,
      otp,
      paymentMethod,
    } as any);

    const orderId = newOrder.id;

    // Also save as active_order so OrderTracking page can read it
    localStorage.setItem('active_order', JSON.stringify(newOrder));
    console.log('Print order saved via OrderSync:', newOrder);
    console.log('Redirecting to tracking view...');
    
    // Show success toast
    toast({
      title: "Print Order Placed!",
      description: "Redirecting to tracking page...",
    });

    // Redirect to tracking view
    navigate(`/order-tracking?orderId=${orderId}`);
    setSubmitting(false);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto animate-fade-in px-4 py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
        Upload Document for Printing
      </h1>

      <div className="mx-auto max-w-3xl">
        {/* Form */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                File Upload
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground file:cursor-pointer hover:file:opacity-90"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Number of Copies
              </label>
              <input
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
                type="number"
                min={1}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Print Type
              </label>
              <div className="flex gap-2">
                {([
                  { value: "bw", label: "Black & White" },
                  { value: "color", label: "Color" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrintType(opt.value)}
                    className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      printType === opt.value
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Delivery Address
              </label>
              <input
                id="delivery-address"
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address..."
                className="w-full rounded-md border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f58634] focus:outline-none focus:ring-2 focus:ring-[#f58634]/20 transition-colors"
                required
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Payment Method
              </label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodSelect('upi')}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#f58634] bg-[#f58634]/5'
                      : 'border-border bg-background hover:border-border hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium text-foreground">UPI Payment</div>
                  <div className="text-sm text-muted-foreground">Pay using UPI apps</div>
                  {paymentMethod === 'upi' && (
                    <CheckCircle size={20} className="text-[#f58634] ml-auto" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentMethodSelect('cash')}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-[#f58634] bg-[#f58634]/5'
                      : 'border-border bg-background hover:border-border hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium text-foreground">Cash on Delivery</div>
                  <div className="text-sm text-muted-foreground">Pay when you receive</div>
                  {paymentMethod === 'cash' && (
                    <CheckCircle size={20} className="text-[#f58634] ml-auto" />
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
              <h4 className="text-sm font-medium text-foreground mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Print Cost:</span>
                  <span className="font-medium">₹{copies * (printType === 'color' ? 5 : 3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charges:</span>
                  <span className="font-medium">₹{deliveryCharges}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">₹{copies * (printType === 'color' ? 5 : 3) + deliveryCharges}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit Print Request
            </button>
          </form>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
};

export default Print;
