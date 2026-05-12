import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Clock, CheckCircle, CreditCard, Smartphone, Wallet, ArrowLeft } from "lucide-react";
import OtpDisplay from "@/components/OtpDisplay";
import { OrderSync, assignVendorToOrder } from "@/lib/orderSync";
import { useToast } from "@/components/ui/use-toast";
import { useHyperdelivData } from "@/lib/hyperdelivData";
import PageWrapper from "@/components/PageWrapper";

const Food = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addOrder } = useHyperdelivData();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropLocation: "",
    pickupTime: "",
    specialInstructions: "",
    paymentMethod: ""
  });
  const [showPickupError, setShowPickupError] = useState(false);
  const [showDropError, setShowDropError] = useState(false);

  // Food package pricing
  const foodPackages = [
    {
      id: "basic",
      name: "Basic Meal Package",
      description: "Standard home-cooked meal with rice, curry, and vegetables",
      price: 120,
      estimatedTime: "30-45 mins"
    },
    {
      id: "premium",
      name: "Premium Meal Package", 
      description: "Deluxe meal with special dishes, dessert, and drinks",
      price: 200,
      estimatedTime: "45-60 mins"
    },
    {
      id: "family",
      name: "Family Package",
      description: "Large portions for 3-4 people with variety of dishes",
      price: 350,
      estimatedTime: "60-75 mins"
    }
  ];

  const [selectedPackage, setSelectedPackage] = useState(foodPackages[0]);

  // Handle URL parameter routing and session persistence
  useEffect(() => {
    const view = searchParams.get('view') || 'food';
    
    // Store user session in localStorage for persistence
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role || 'User');
    }
    
    // Check if user has valid session
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    const hasValidSession = storedUser && storedRole;
    
    // Redirect to login if no valid session
    if (!user && !hasValidSession) {
      navigate("/login", { replace: true });
      return;
    }
  }, [searchParams, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error states when user starts typing
    if (field === 'pickupLocation') {
      setShowPickupError(false);
      const pickupInput = document.getElementById('pickup-location') as HTMLInputElement;
      if (pickupInput) {
        pickupInput.style.borderColor = '';
      }
    }
    if (field === 'dropLocation') {
      setShowDropError(false);
      const dropInput = document.getElementById('drop-location') as HTMLInputElement;
      if (dropInput) {
        dropInput.style.borderColor = '';
      }
    }
  };

  const handleNextStep = () => {
    if (validateAddresses()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handlePackageSelect = (pkg: typeof foodPackages[0]) => {
    setSelectedPackage(pkg);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const validateAddresses = () => {
    let hasError = false;
    
    if (!formData.pickupLocation.trim()) {
      setShowPickupError(true);
      const pickupInput = document.getElementById('pickup-location') as HTMLInputElement;
      if (pickupInput) {
        pickupInput.style.borderColor = '#ef4444';
      }
      hasError = true;
    }
    
    if (!formData.dropLocation.trim()) {
      setShowDropError(true);
      const dropInput = document.getElementById('drop-location') as HTMLInputElement;
      if (dropInput) {
        dropInput.style.borderColor = '#ef4444';
      }
      hasError = true;
    }
    
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!formData.paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create order using OrderSync (writes to dabbaflow_orders - shared with Vendor & Admin)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const itemPrice = selectedPackage?.price || 50;
    const deliveryFee = 20;
    const serviceCharge = 15;

    const newOrder = OrderSync.addOrder({
      type: 'Food',
      details: {
        restaurant: 'Campus Food Court',
        items: [
          {
            name: selectedPackage?.name || 'Custom Order',
            quantity: 1,
            price: itemPrice
          }
        ],
        deliveryLocation: formData.dropLocation,
        pickupLocation: formData.pickupLocation,
        specialInstructions: formData.specialInstructions,
        paymentMethod: formData.paymentMethod
      },
      status: 'Pending',
      customer: user?.email || 'Student User',
      price: itemPrice + deliveryFee + serviceCharge,
      itemPrice,
      deliveryFee,
      serviceCharge,
      otp,
    } as any);

    const orderId = newOrder.id;

    // Also save as active_order so OrderTracking page can read it
    localStorage.setItem('active_order', JSON.stringify(newOrder));
    console.log('Order saved via OrderSync:', newOrder);
    
    // Show success toast
    toast({
      title: "Order Placed!",
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
          Order Home-Cooked Meals
        </h1>

        <div className="mx-auto max-w-3xl">
          {/* Order Form */}
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentStep === 1 ? "Place Your Order" : "Select Payment Method"}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${currentStep === 1 ? 'bg-[#f58634] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </span>
                  <span>→</span>
                  <span className={`px-2 py-1 rounded ${currentStep === 2 ? 'bg-[#f58634] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Step 1: Address Information */}
              {currentStep === 1 && (
                <>
                  {/* Two-column grid for locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Location */}
                    <div>
                      <label htmlFor="pickup-location" className="mb-2 block text-sm font-medium text-foreground">
                        Pickup Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          id="pickup-location"
                          type="text"
                          value={formData.pickupLocation}
                          onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                          placeholder="Enter pickup address..."
                          className="w-full rounded-md border border-border bg-background pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f58634] focus:outline-none focus:ring-2 focus:ring-[#f58634]/20 transition-colors"
                          required
                        />
                      </div>
                      {showPickupError && (
                        <p className="mt-1 text-sm text-destructive">Please enter a pickup location</p>
                      )}
                    </div>

                    {/* Drop Location */}
                    <div>
                      <label htmlFor="drop-location" className="mb-2 block text-sm font-medium text-foreground">
                        Drop Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                          id="drop-location"
                          type="text"
                          value={formData.dropLocation}
                          onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                          placeholder="Enter delivery address..."
                          className="w-full rounded-md border border-border bg-background pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f58634] focus:outline-none focus:ring-2 focus:ring-[#f58634]/20 transition-colors"
                          required
                        />
                      </div>
                      {showDropError && (
                        <p className="mt-1 text-sm text-destructive">Please enter a drop location</p>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label htmlFor="special-instructions" className="mb-2 block text-sm font-medium text-foreground">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      id="special-instructions"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                      className="w-full rounded-md border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#f58634] focus:outline-none focus:ring-2 focus:ring-[#f58634]/20 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Step 2: Payment Method Selection */}
              {currentStep === 2 && (
                <>
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
                          formData.paymentMethod === 'upi'
                            ? 'border-[#f58634] bg-[#f58634]/5'
                            : 'border-border bg-background hover:border-border hover:bg-secondary'
                        }`}
                      >
                        <Smartphone size={20} className="text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium text-foreground">UPI Payment</div>
                          <div className="text-sm text-muted-foreground">Pay using UPI apps</div>
                        </div>
                        {formData.paymentMethod === 'upi' && (
                          <CheckCircle size={20} className="text-[#f58634] ml-auto" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePaymentMethodSelect('cash')}
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                          formData.paymentMethod === 'cash'
                            ? 'border-[#f58634] bg-[#f58634]/5'
                            : 'border-border bg-background hover:border-border hover:bg-secondary'
                        }`}
                      >
                        <Wallet size={20} className="text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium text-foreground">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive</div>
                        </div>
                        {formData.paymentMethod === 'cash' && (
                          <CheckCircle size={20} className="text-[#f58634] ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                <h4 className="text-sm font-medium text-foreground mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selectedPackage.name}:</span>
                    <span className="font-medium">₹{selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    <span className="font-medium">₹20</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge:</span>
                    <span className="font-medium">₹15</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">₹{selectedPackage.price + 20 + 15}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2 px-6 py-3 border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting 
                    ? (currentStep === 1 ? "Next..." : "Placing Order...")
                    : (currentStep === 1 ? "Next" : "Place Order")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* OTP Display */}
      <OtpDisplay onClose={() => {}} />
    </PageWrapper>
  );
};

export default Food;
