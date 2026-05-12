import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Demo users for the system
const DEMO_USERS = [
  { id: 1, email: "user@demo.com", password: "user123", fullName: "Demo User", role: "user" },
];

export const useHyperdelivData = () => {
  const [data, setData] = useState({
    users: DEMO_USERS,
    orders: []
  });

  const { user } = useAuth();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('hyperdeliv_users');
    const storedOrders = localStorage.getItem('hyperdeliv_orders');
    const activeOrder = localStorage.getItem('active_order');

    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers)) {
          setData(prev => ({
            ...prev,
            users: parsedUsers
          }));
        }
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
      }
    }

    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders)) {
          setData(prev => ({
            ...prev,
            orders: parsedOrders
          }));
        }
      } catch (error) {
        console.error('Error parsing orders from localStorage:', error);
      }
    }

    if (activeOrder) {
      try {
        const parsedOrder = JSON.parse(activeOrder);
        setData(prev => ({
          ...prev,
          activeOrder: parsedOrder
        }));
      } catch (error) {
        console.error('Error parsing active order from localStorage:', error);
      }
    }
  }, [user]);

  const addOrder = (order: any) => {
    setData(prev => ({
      ...prev,
      orders: [...prev.orders, order]
    }));
  };

  const getAllOrders = () => {
    return data.orders;
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setData(prev => ({
      ...prev,
      orders: prev.orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    }));
  };

  return {
    data,
    addOrder,
    getAllOrders,
    updateOrderStatus
  };
};
