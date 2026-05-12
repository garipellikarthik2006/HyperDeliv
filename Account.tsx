import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Camera, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

const Account = () => {
  const { user } = useAuth();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "addresses">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || user?.email?.split("@")[0] || "Guest",
    email: currentUser?.email || user?.email || "",
    phone: currentUser?.phone || "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    deliveryAlerts: true,
    emailDigest: false,
  });

  const [addresses] = useState([
    { id: 1, label: "Home", address: "Block A, Room 204, Hostel Complex", isDefault: true },
    { id: 2, label: "Department", address: "CSE Department, Main Building, 2nd Floor", isDefault: false },
  ]);

  const handleSaveProfile = () => {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...currentUser, ...profileForm })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const tabs: { key: "profile" | "security" | "notifications" | "addresses"; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "security", label: "Security" },
    { key: "notifications", label: "Notifications" },
    { key: "addresses", label: "Addresses" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Tab Navigation — identical pattern to Dashboard */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b-2 border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 px-4 text-sm font-semibold capitalize transition-colors border-l-2 border-gray-200 first:border-l-0 ${
                  activeTab === tab.key
                    ? "border-b-2 border-orange-500 text-orange-500 bg-orange-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Avatar card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold">
                  {profileForm.fullName.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow">
                  <Camera size={14} />
                </button>
              </div>
              <div className="font-semibold text-gray-900 text-lg">{profileForm.fullName}</div>
              <div className="text-sm text-gray-500 mt-1">{profileForm.email}</div>
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
                <CheckCircle size={12} /> Verified Account
              </div>
            </div>

            {/* Profile form */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us a little about yourself..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  {savedSuccess && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Saved successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-orange-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <button className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                  Update Password
                </button>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-orange-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Email Verified", status: true },
                  { label: "Phone Verified", status: !!currentUser?.phone },
                  { label: "Two-Factor Authentication", status: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-orange-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            </div>
            <div className="space-y-1">
              {(
                [
                  { key: "orderUpdates", label: "Order Updates", desc: "Status changes for your active orders" },
                  { key: "promotions", label: "Promotions & Offers", desc: "Deals, discounts, and special offers" },
                  { key: "deliveryAlerts", label: "Delivery Alerts", desc: "Real-time alerts when your order is nearby" },
                  { key: "emailDigest", label: "Weekly Email Digest", desc: "Summary of your activity each week" },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      notifications[item.key] ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        notifications[item.key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              <Save size={16} />
              Save Preferences
            </button>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{addr.address}</div>
                  </div>
                </div>
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                  Edit
                </button>
              </div>
            ))}

            {/* Add new address */}
            <button className="w-full bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2">
              <MapPin size={16} />
              Add New Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
