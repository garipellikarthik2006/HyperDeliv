import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Download, Eye } from "lucide-react";

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastNotificationsProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export const ToastNotifications = ({ notifications, onRemove }: ToastNotificationsProps) => {
  useEffect(() => {
    // Auto-remove notifications after duration
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration || 3000);
      
      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  const getIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'info':
        return <Download size={20} className="text-blue-600" />;
      default:
        return <Eye size={20} className="text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            relative flex items-center gap-3 p-4 rounded-lg border shadow-lg
            min-w-[320px] max-w-[400px]
            transform transition-all duration-300 ease-in-out
            animate-slide-in
            ${getBackgroundColor(notification.type)}
          `}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {notification.message}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;
