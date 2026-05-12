// Centralized Data Management for DabbaFlow Hub
// Prevents "White Screen of Death" during page refreshes

import { useState } from 'react';

export interface DabbaflowData {
  orders: any[];
  currentUser: any;
  activeTab: string;
}

const DABBAFLOW_KEY = 'dabbaflow_data';

// Initialize with default data
const getInitialData = (): DabbaflowData => {
  const stored = localStorage.getItem(DABBAFLOW_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored data:', error);
    }
  }
  
  return {
    orders: [],
    currentUser: null,
    activeTab: 'overview'
  };
};

// Save data to localStorage
const saveData = (data: DabbaflowData): void => {
  try {
    localStorage.setItem(DABBAFLOW_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Get URL parameters
const getFromUrl = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
  return null;
};

// Set URL parameter without full page reload
const setUrlParam = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    const newUrl = url.toString();
    window.history.replaceState({}, '', newUrl);
  }
};

// Main data management hook
export const useDabbaflowData = () => {
  const [data, setData] = useState<DabbaflowData>(getInitialData());

  // Save data whenever it changes
  const updateData = (updates: Partial<DabbaflowData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      saveData(newData);
      return newData;
    });
  };

  // Add new order
  const addOrder = (order: any) => {
    const newOrder = {
      ...order,
      id: order.id || `#${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Get current data from localStorage first
    const currentData = getInitialData();
    const updatedOrders = [...currentData.orders, newOrder];
    
    // Save immediately to localStorage
    const updatedData = { ...currentData, orders: updatedOrders };
    saveData(updatedData);
    
    // Update React state
    updateData({ orders: updatedOrders });
    
    console.log('Order saved:', newOrder);
    console.log('All orders:', updatedOrders);
    
    return newOrder; // Return the saved order with ID
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: string) => {
    updateData({
      orders: data.orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    });
  };

  // Get orders for vendor
  const getVendorOrders = (vendorId?: string) => {
    return data.orders.filter(order => 
      order.vendorId === vendorId || 
      (order.type === 'Food' && order.details?.restaurant) ||
      (order.type === 'Print' && order.details?.fileName)
    );
  };

  // Get all orders directly from localStorage
  const getAllOrders = () => {
    const storedData = localStorage.getItem(DABBAFLOW_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return parsedData.orders || [];
      } catch (error) {
        console.error('Error parsing stored data:', error);
        return [];
      }
    }
    return [];
  };

  // Tab management
  const setActiveTab = (tab: string) => {
    const currentUrl = getFromUrl('tab');
    if (currentUrl !== tab) {
      setUrlParam('tab', tab);
      updateData({ activeTab: tab });
    }
  };

  return {
    data,
    addOrder,
    updateOrderStatus,
    getVendorOrders,
    getAllOrders,
    setActiveTab,
    saveData
  };
};
