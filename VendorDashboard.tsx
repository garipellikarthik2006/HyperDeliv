import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardList, Printer, Wallet, MapPin, Phone, CheckCircle, Clock, Download, Eye, User, Shield, Bell, CreditCard, HelpCircle } from "lucide-react";
import { ToastNotifications } from "@/components/ToastNotifications";
import { VerifyDeliveryModal } from "@/components/VerifyDeliveryModal";
import { OtpVerificationModal } from "@/components/OtpVerificationModal";
import { OrderSync, setupOrderSyncListener } from "@/lib/orderSync";
import PageWrapper from "@/components/PageWrapper";

interface FoodJob {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  recipientPhone: string;
  estimatedTime: string;
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  postedTime: string;
}

interface PrintJob {
  id: string;
  fileName: string;
  documentType: 'bw' | 'color';
  pageCount: number;
  fileSize: string;
  status: 'pending' | 'processing' | 'accepted' | 'printed_ready' | 'completed';
  postedTime: string;
  amount: number;
  dropLocation?: string;
  recipientPhone?: string;
  downloaded?: boolean;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'print' | 'earnings' | 'account'>('overview');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentOTP, setCurrentOTP] = useState('');
  const [foodJobs, setFoodJobs] = useState<FoodJob[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [verifyModalJob, setVerifyModalJob] = useState<{ id: string; type: 'food' | 'print' } | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Account settings state
  const [accountTab, setAccountTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    fullName: user?.email || "",
    phone: user?.phone || ""
  });

  // Helper function to show toast notifications
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Add overlay to sidebar when any modal is open
  useEffect(() => {
    if (showVerifyModal || showOtpModal) {
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-modal-open');
    }
    return () => document.body.removeAttribute('data-modal-open');
  }, [showVerifyModal, showOtpModal]);

  // Real-time order synchronization
  useEffect(() => {
    const cleanup = setupOrderSyncListener((orders) => {
      // Filter orders for this vendor (for now, show all orders)
      const vendorFoodOrders = orders
        .filter(order => order.type === 'Food')
        .map(order => ({
          id: order.id,
          pickupLocation: (order.details as any)?.restaurant || 'Campus Food Court',
          dropLocation: (order.details as any)?.deliveryLocation || 'Various Locations',
          recipientPhone: 'N/A',
          estimatedTime: '30-45 mins',
          amount: order.price,
          status: (order.status.toLowerCase() === 'pending' ? 'pending' : 
               order.status.toLowerCase() === 'accepted' ? 'accepted' : 
               order.status.toLowerCase() === 'ready' ? 'in_progress' : 
               order.status.toLowerCase() === 'delivered' ? 'completed' : 'pending') as FoodJob['status'],
          postedTime: order.createdAt,
        }));
      
      const vendorPrintOrders = orders
        .filter(order => order.type === 'Print')
        .map(order => ({
          id: order.id,
          fileName: (order.details as any)?.fileName || 'Document.pdf',
          documentType: (order.details as any)?.documentType || 'bw',
          pageCount: (order.details as any)?.pageCount || 1,
          fileSize: (order.details as any)?.fileSize || '1.2 MB',
          status: (order.status.toLowerCase() === 'pending' ? 'pending' : 
               order.status.toLowerCase() === 'accepted' ? 'accepted' : 
               order.status.toLowerCase() === 'ready' ? 'processing' : 
               order.status.toLowerCase() === 'delivered' ? 'completed' : 'pending') as PrintJob['status'],
          postedTime: order.createdAt,
          amount: order.price,
          dropLocation: (order.details as any)?.dropLocation || 'Main Gate',
          recipientPhone: 'N/A'
        }));
      
      setFoodJobs(vendorFoodOrders);
      setPrintJobs(vendorPrintOrders);
    });
    
    return cleanup;
  }, [user?.id]);

  // Set active tab from URL parameter on component mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'jobs' || tabParam === 'print' || tabParam === 'earnings' || tabParam === 'account') {
      setActiveTab(tabParam);
    } else {
      // Default to overview tab if no valid tab parameter
      setActiveTab('overview');
      navigate('/vendor?tab=overview', { replace: true });
    }
    
    // Reset all modal states when tab changes
    setShowVerifyModal(false);
    setShowOtpModal(false);
    setVerifyModalJob(null);
    setCurrentOTP('');
  }, [searchParams]);

  // Load vendor profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('vendorProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(parsed);
      } catch (e) {
        console.error('Error loading vendor profile:', e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('vendorProfile', JSON.stringify(profileData));
    if (user) Object.assign(user, profileData);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully saved.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been successfully changed.",
    });
  };

  // Update URL when tab changes
  const handleTabChange = (tab: 'overview' | 'jobs' | 'print' | 'earnings' | 'account') => {
    setActiveTab(tab);
    navigate(`/vendor?tab=${tab}`, { replace: true });
  };

  const handleDownloadFile = (jobId: string) => {
    // Mark file as downloaded
    setPrintJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, downloaded: true } : job
    ));
    
    // Show success notification
    showToast('info', 'File downloaded successfully! Review before accepting.');
  };

  const handleAcceptPrintJob = (jobId: string) => {
    setPrintJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'processing' } : job
    ));
    
    // Update order status in shared data
    OrderSync.updateOrderStatus(jobId, 'Accepted');
    
    // Show success notification
    showToast('success', `Job #${jobId} accepted. Proceed to printing.`);
  };

  const handleMarkPrintAsReady = (jobId: string) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in localStorage for User page to access
    const otpData = {
      otp: otp,
      jobId: jobId,
      jobType: 'print',
      timestamp: new Date().toISOString(),
      vendorId: user?.id || 'vendor-123'
    };
    localStorage.setItem('currentDeliveryOTP', JSON.stringify(otpData));
    
    setPrintJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'printed_ready' } : job
    ));
    
    // Update order status in shared data
    OrderSync.updateOrderStatus(jobId, 'Ready');
    
    // Show verification modal
    setVerifyModalJob({ id: jobId, type: 'print' });
    setShowVerifyModal(true);
    
    showToast('info', 'Job marked as ready. Initiating delivery.');
  };

  const handleMarkPrintAsDelivered = (jobId: string) => {
    // Generate OTP and show modal for verification
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setCurrentOTP(otp);
    setVerifyModalJob({ id: jobId, type: 'print' });
    setShowOtpModal(true);
    
    // Store OTP in localStorage
    const otpData = {
      otp: otp,
      jobId: jobId,
      jobType: 'print',
      timestamp: new Date().toISOString(),
      vendorId: user?.id || 'vendor-123'
    };
    localStorage.setItem('currentDeliveryOTP', JSON.stringify(otpData));
  };

  const handleAcceptFoodJob = (jobId: string) => {
    setFoodJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'accepted' } : job
    ));
    
    // Update order status in shared data
    OrderSync.updateOrderStatus(jobId, 'Accepted');
    
    // Show success notification
    showToast('success', `Job #${jobId} accepted. Proceed to delivery.`);
  };

  const handleMarkFoodAsReady = (jobId: string) => {
    // Generate a random 4-digit OTP for verification
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in localStorage for User page to access
    const otpData = {
      otp: otp,
      jobId: jobId,
      jobType: 'food',
      timestamp: new Date().toISOString(),
      vendorId: user?.id || 'vendor-123'
    };
    localStorage.setItem('currentDeliveryOTP', JSON.stringify(otpData));
    
    setFoodJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'in_progress' } : job
    ));
    
    // Update order status in shared data
    OrderSync.updateOrderStatus(jobId, 'Ready');
    
    // Show verification modal
    setVerifyModalJob({ id: jobId, type: 'food' });
    setShowVerifyModal(true);
    
    showToast('info', 'Job marked as ready. Initiating delivery.');
  };

  const handleVerifyModalConfirm = () => {
    if (verifyModalJob) {
      // Generate OTP for delivery verification
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setCurrentOTP(otp);
      
      // Store OTP in localStorage
      const otpData = {
        otp: otp,
        jobId: verifyModalJob.id,
        jobType: verifyModalJob.type,
        timestamp: new Date().toISOString(),
        vendorId: user?.id || 'vendor-123'
      };
      localStorage.setItem('currentDeliveryOTP', JSON.stringify(otpData));
      
      // Close verify modal and show OTP modal
      setShowVerifyModal(false);
      setShowOtpModal(true);
    }
  };

  const handleVerifyModalClose = () => {
    setShowVerifyModal(false);
    setVerifyModalJob(null);
  };

  const handleOtpVerification = (enteredOTP: string) => {
    if (enteredOTP === currentOTP && verifyModalJob) {
      const jobId = verifyModalJob.id;
      const jobType = verifyModalJob.type;

      // Mark job as completed in React state
      if (jobType === 'food') {
        setFoodJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, status: 'completed' } : job
        ));
      } else {
        setPrintJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, status: 'completed' } : job
        ));
      }

      // Update order status in OrderSync (dabbaflow_orders) so it persists
      OrderSync.updateOrderStatus(jobId, 'Delivered');

      // Update active_order in localStorage so tracking page reflects delivery
      const activeOrderRaw = localStorage.getItem('active_order');
      if (activeOrderRaw) {
        try {
          const activeOrder = JSON.parse(activeOrderRaw);
          if (activeOrder.id === jobId) {
            localStorage.setItem('active_order', JSON.stringify({
              ...activeOrder,
              status: 'Delivered',
              deliveredAt: new Date().toISOString()
            }));
          }
        } catch (e) {}
      }

      // Save earnings to localStorage for persistence across sessions
      const earningsKey = 'vendor_earnings';
      const existingEarnings = JSON.parse(localStorage.getItem(earningsKey) || '[]');
      const job = jobType === 'food'
        ? foodJobs.find(j => j.id === jobId)
        : printJobs.find(j => j.id === jobId);
      if (job) {
        existingEarnings.push({
          orderId: jobId,
          type: jobType,
          amount: job.amount,
          completedAt: new Date().toISOString()
        });
        localStorage.setItem(earningsKey, JSON.stringify(existingEarnings));
      }

      showToast('success', `Delivery verified! ₹${job?.amount || 0} added to your earnings.`);
      setShowOtpModal(false);
      setVerifyModalJob(null);
      setCurrentOTP('');
    } else {
      showToast('error', 'Invalid OTP. Please try again.');
    }
  };

  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    setVerifyModalJob(null);
    setCurrentOTP('');
  };

  // Calculate statistics
  const stats = {
    totalFoodJobs: foodJobs.length,
    activeFoodJobs: foodJobs.filter(job => job.status === 'accepted' || job.status === 'in_progress').length,
    completedFoodJobs: foodJobs.filter(job => job.status === 'completed').length,
    totalPrintJobs: printJobs.length,
    activePrintJobs: printJobs.filter(job => job.status === 'accepted' || job.status === 'processing' || job.status === 'printed_ready').length,
    completedPrintJobs: printJobs.filter(job => job.status === 'completed').length,
    totalEarnings: [...foodJobs, ...printJobs].reduce((total, job) => total + (job.status === 'completed' ? job.amount : 0), 0)
  };

  return (
    <PageWrapper>
      <div className="lg:ml-64 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Manage your food delivery and print services</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b-2 border-gray-200">
            {['overview', 'jobs', 'print', 'earnings', 'account'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                className={`pb-2 px-4 text-sm font-semibold capitalize transition-colors border-l-2 border-gray-200 first:border-l-0 ${
                  activeTab === tab
                    ? 'border-b-2 border-orange-500 text-orange-500 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total Orders</span>
                <ClipboardList className="text-orange-500" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalFoodJobs + stats.totalPrintJobs}</div>
              <div className="text-sm text-gray-500">Total orders received</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Active Jobs</span>
                <Clock className="text-blue-500" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeFoodJobs + stats.activePrintJobs}</div>
              <div className="text-sm text-gray-500">Currently in progress</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Completed Jobs</span>
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedFoodJobs + stats.completedPrintJobs}</div>
              <div className="text-sm text-gray-500">Successfully delivered</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Pending Jobs</span>
                <ClipboardList className="text-yellow-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{foodJobs.filter(job => job.status === 'pending').length}</div>
              <div className="text-sm text-gray-500">Waiting for acceptance</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total Earnings</span>
                <Wallet className="text-green-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings}</div>
              <div className="text-sm text-gray-500">From completed orders</div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Delivery Jobs</h3>
            <p className="text-sm text-gray-600 mb-4">New food delivery orders will appear here in real-time</p>
            
            {/* Food Delivery Jobs */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Active Orders</h4>
              {foodJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No food delivery orders yet</div>
                </div>
              ) : (
                foodJobs.map((job) => (
                  <div key={job.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">#{job.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status === 'completed' ? 'Completed' :
                             job.status === 'accepted' ? 'Accepted' :
                             job.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{job.pickupLocation} → {job.dropLocation}</div>
                        <div className="text-xs text-gray-500 mt-1">{job.postedTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{job.amount}</div>
                        {job.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptFoodJob(job.id)}
                            className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {job.status === 'accepted' && (
                          <button
                            onClick={() => handleMarkFoodAsReady(job.id)}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Queue</h3>
            <p className="text-sm text-gray-600 mb-4">Manage print jobs and document processing</p>
            
            <div className="space-y-4">
              {printJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No print jobs in queue</div>
                </div>
              ) : (
                printJobs.map((job) => (
                  <div key={job.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">#{job.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'printed_ready' ? 'bg-purple-100 text-purple-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status === 'completed' ? 'Completed' :
                             job.status === 'printed_ready' ? 'Print Ready' :
                             job.status === 'processing' ? 'Processing' :
                             job.status === 'accepted' ? 'Accepted' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{job.fileName}</div>
                        <div className="text-xs text-gray-500 mt-1">{job.postedTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{job.amount}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleDownloadFile(job.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            disabled={job.downloaded}
                          >
                            <Download size={16} />
                          </button>
                          {job.status === 'pending' && (
                            <button
                              onClick={() => handleAcceptPrintJob(job.id)}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                            >
                              Accept Job
                            </button>
                          )}
                          {job.status === 'accepted' && (
                            <button
                              onClick={() => handleMarkPrintAsReady(job.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Mark as Ready
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (() => {
          const completedFood = foodJobs.filter(j => j.status === 'completed');
          const completedPrint = printJobs.filter(j => j.status === 'completed');
          const foodTotal = completedFood.reduce((s, j) => s + j.amount, 0);
          const printTotal = completedPrint.reduce((s, j) => s + j.amount, 0);
          const grandTotal = foodTotal + printTotal;
          const allCompleted = [
            ...completedFood.map(j => ({ ...j, jobType: 'Food' })),
            ...completedPrint.map(j => ({ ...j, jobType: 'Print' }))
          ].sort((a, b) => new Date(b.postedTime).getTime() - new Date(a.postedTime).getTime());

          return (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-5">
                  <div className="text-sm text-orange-700 font-medium mb-1">Total Earnings</div>
                  <div className="text-3xl font-bold text-orange-600">₹{grandTotal}</div>
                  <div className="text-xs text-orange-500 mt-1">{allCompleted.length} orders completed</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="text-sm text-gray-600 font-medium mb-1">Food Deliveries</div>
                  <div className="text-2xl font-bold text-gray-900">₹{foodTotal}</div>
                  <div className="text-xs text-gray-500 mt-1">{completedFood.length} deliveries</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="text-sm text-gray-600 font-medium mb-1">Print Jobs</div>
                  <div className="text-2xl font-bold text-gray-900">₹{printTotal}</div>
                  <div className="text-xs text-gray-500 mt-1">{completedPrint.length} jobs</div>
                </div>
              </div>

              {/* Completed Orders List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Completed Orders</h4>
                {allCompleted.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No completed orders yet. Verify deliveries via OTP to earn.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCompleted.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            job.jobType === 'Food' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {job.jobType === 'Food' ? '🍱' : '🖨️'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Order {job.id}</div>
                            <div className="text-xs text-gray-500">{job.jobType} • {new Date(job.postedTime).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">+₹{job.amount}</div>
                          <div className="text-xs text-green-500">Delivered</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Account Settings Tab */}
        {activeTab === 'account' && (() => {
          const accountTabs = [
            { id: "profile", label: "Profile", icon: User },
            { id: "security", label: "Security", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "billing", label: "Billing", icon: CreditCard },
            { id: "help", label: "Help", icon: HelpCircle }
          ];

          const renderAccountContent = () => {
            switch (accountTab) {
              case "profile":
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Profile Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-900">Full Name</label>
                          <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Enter your full name"
                            className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-900">Phone Number</label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                            className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              case "security":
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Security Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-900">Current Password</label>
                          <input type="password" placeholder="Enter current password" className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-900">New Password</label>
                          <input type="password" placeholder="Enter new password" className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-900">Confirm New Password</label>
                          <input type="password" placeholder="Confirm new password" className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                      </div>
                      <button onClick={handlePasswordChange} className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                        Update Password
                      </button>
                    </div>
                  </div>
                );
              case "notifications":
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Notification Preferences</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">Email notifications for orders</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">SMS notifications for delivery updates</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">Promotional emails</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">Push notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              case "billing":
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Billing Information</h3>
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-gray-100 p-4">
                          <p className="text-sm text-gray-600">Current Plan</p>
                          <p className="text-lg font-semibold text-gray-900">Free Plan</p>
                          <p className="text-sm text-gray-600">Upgrade to Premium for more features</p>
                        </div>
                        <button className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              case "help":
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Help & Support</h3>
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-white p-4">
                          <h4 className="font-medium text-gray-900">Frequently Asked Questions</h4>
                          <p className="mt-2 text-sm text-gray-600">Find answers to common questions about using HyperDeliv.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-4">
                          <h4 className="font-medium text-gray-900">Contact Support</h4>
                          <p className="mt-2 text-sm text-gray-600">Get in touch with our support team for assistance.</p>
                        </div>
                        <div className="rounded-lg border bg-white p-4">
                          <h4 className="font-medium text-gray-900">Report an Issue</h4>
                          <p className="mt-2 text-sm text-gray-600">Report bugs or issues you encounter while using the platform.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          };

          return (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h2>
                <p className="text-gray-600">Manage your vendor account settings and preferences</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-4">
                {/* Account Sidebar */}
                <div className="lg:col-span-1">
                  <nav className="space-y-1">
                    {accountTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setAccountTab(tab.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                          accountTab === tab.id
                            ? "bg-orange-600/10 text-orange-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                {/* Account Content */}
                <div className="lg:col-span-3">
                  <div className="rounded-lg border bg-white p-6 shadow-sm">
                    {renderAccountContent()}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Toast Notifications */}
      <ToastNotifications
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {/* Verify Delivery Modal */}
      <div data-modal-content>
        <VerifyDeliveryModal
          isOpen={showVerifyModal}
          onClose={handleVerifyModalClose}
          onConfirm={handleVerifyModalConfirm}
          jobId={verifyModalJob?.id || ''}
          jobType={verifyModalJob?.type || 'food'}
        />
      </div>
      
      {/* OTP Verification Modal */}
      <div data-modal-content>
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={handleOtpModalClose}
          onConfirm={handleOtpVerification}
          correctOTP={currentOTP}
        />
      </div>
    </PageWrapper>
  );
};

export default VendorDashboard;